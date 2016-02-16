var myDataRef = new Firebase('https://scorching-heat-2457.firebaseio.com/');

$('#stakeHoldersInput').keypress(function (e) {
	if (e.keyCode == 13) {
		var stakeHolders = $('#stakeHoldersInput').val();
		var importance = $('#importanceInput').val();
		myDataRef.push({stakeHolders: stakeHolders, importance: importance});
		$('#importanceInput').val(1);
	}
});

myDataRef.on('child_added', function(snapshot) {
	console.log('test1');
	var data = snapshot.val();
	var verdict='';
	if(data.stakeHolders<2 && data.importance<2){
		verdict='Flip a coin!';
	}else{
		verdict='This app does not yest know how to deal with these inputs';
	}
	displayChatMessage(verdict);
});

function displayChatMessage(verdict) {
	console.log('test2');
	$('<div/>').text(verdict).appendTo($('#messagesDiv'));
	// .prepend($('<em/>').text(stakeHolders+': '));
	$('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
}