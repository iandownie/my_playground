addEvent(window, 'load', init);
var elementsLoaded=0;
var loading=false;

function init(){
  if($('body.test-site').length>0){
    buildPage(pageData.testPage);
    cardFlip();
    viewMore();
  }else{
    sectionImports();
  }
}

function viewMore(){
  $( window ).scroll(function() {
    if($( ".detector" ).offset().top > $( ".detector-two" ).offset().top && loading === false && gridItems.length > 0){
      $('.grid-container').css('max-height', $('.grid-container').height());
      gridImports(gridItems);
    }
  });
}

function cardFlip(){
  $('.grid-element button.button').click(function(){
    var card = $(this).parent().parent();
    card.addClass('flipped');
    card.parent().mouseleave(function(){
      $(this).children('.flipped').removeClass('flipped');
    });
  });
}

function sectionImports(){ // import all HTML imports
  for(var i=0; i<$('.main-sections link[rel="import"]').length; i++){
    var link=$('.main-sections link[rel="import"]')[i];
    var content = link.import;
    var el = content.querySelector('section');// Grab DOM from html's document.
    $('div.container').append(el.cloneNode(true));
  }
}

function gridImports(items){ // import grid items
  var currentElementNumber=items.length;
  if(items.length >= 20){
    currentElementNumber=20;
  }
  items.forEach(function(e, i){
    var gridElement=$('.grid-items link[rel="import"]')[0];
    var content = gridElement.import;
    var el = content.querySelector('.grid-element');// Grab DOM from html's document.
    if( i === 0 ){
      loading = true;
      $('.loader').css('opacity', 1);
    }
    if( i <= currentElementNumber - 1 ){
      el.querySelector('img').setAttribute('src', items[i].itemImage);
      el.querySelector('h3.grid-item-text').innerHTML=items[i].itemText;
      el.querySelector('h3.grid-item-fact').innerHTML=items[i].itemFact;
      $('.grid-container').append(el.cloneNode(true));
      if(i === currentElementNumber - 1){
        $('.grid-container').append($('.detector-two'));
        gridItems = gridItems.slice(20,gridItems.length);
      }
    }
  });
  $('img').load(function(){
    elementsLoaded++;
    if(elementsLoaded>=currentElementNumber){
      cardFlip();
      var currentHeight=$('.grid-container').css('max-height');
      var newHeight=Number(currentHeight.split('px')[0])*2+'px';
      if(Number(currentHeight.split('px')[0])*2 < 300) {
        newHeight= '1500px';
      }
      $('.grid-container').css('max-height', newHeight);
      elementsLoaded=0;
      setTimeout(function(){
        $('.loader').css('opacity', 0);
        $('.grid-container').css('max-height', 'none');
        loading=false;
      }, 1000);
    }
  });
}

function buildPage(testPage){
  testPage.pageSections.forEach(function(e, i){
    if (e.sectionType==='grid'){
      if($( ".detector" ).offset().top > $( ".detector-two" ).offset().top && loading === false){
        $('.grid-container').css('max-height', $('.grid-container').height());
        gridImports(gridItems);
      }
    }else if(e.sectionType==='three-block'){
      sectionImports();
    }
  });
}

function addEvent( obj, type, fn ) {
  if ( obj.attachEvent ) {
    obj["e"+type+fn] = fn;
    obj[type+fn] = function() { obj["e"+type+fn]( window.event ); };
    obj.attachEvent( "on"+type, obj[type+fn] );
  } 
  else{
    obj.addEventListener( type, fn, false );
  }
}

var gridItems=[
  {
    "itemText": "Algeria",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "The Hilton Alger has 412 rooms, including 40 deluxe suites"
  }, {
    "itemText": "Argentina",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "The Anselmo Buenos Aires, Curio Collection by Hilton joined the Hilton family in 2015"
  }, {
    "itemText": "Aruba",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "The Hilton Aruba spans 15 acres of beach"
  }, {
    "itemText": "Australia",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Guests can get up close and personal with massive saltwater crocodiles at the exciting Crocosaurus Cove near the DoubleTree by Hilton Hotel Darwin"
  }, {
    "itemText": "Austria",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Surrounded by the majestic Tyrolean Alps, Hilton Innsbruck is adjacent to the country's largest casino"
  }, {
    "itemText": "Azerbaijan",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Baku is located just a short walk along the Caspian Sea Boulevard to the famous 12th-century city walls of Icheri Sheher"
  }, {
    "itemText": "Bahamas",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "British Colonial Hilton Nassau is located on the only private beach in Nassau, on the site of the Old Fort of Nassau"
  }, {
    "itemText": "Barbados",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Barbados Resort's grounds are home to Charles Fort, erected in 1650 by the British military to protect Carlisle Bay from enemy attacks"
  }, {
    "itemText": "Belarus",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hampton by Hilton Minsk City Centre is the first internationally-branded hotel to open in the mid-scale sector in Belarus"
  }, {
    "itemText": "Belgium",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Antwerp Old Town's facade dates back to 1864, when the building housed the Grand Bazar Shopping Mall"
  }, {
    "itemText": "Bolivia",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hampton Inn by Hilton Santa Cruz\/Equipetrol is Hilton's first property in Bolivia"
  }, {
    "itemText": "Brazil",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Sao Paulo Morumbi's Canvas Bar & Restaurant is themed like an artist's studio, with art hanging from the high ceilings of the dramatic restaurant"
  }, {
    "itemText": "Bulgaria",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "DoubleTree by Hilton Hotel Varna - Golden Sands is located in the ancient and protected forest of Golden Sands Natural Park and overlooks the Black Sea coast"
  }, {
    "itemText": "Cameroon",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Yaounde is the only international hotel in Cameroon's capital"
  }, {
    "itemText": "Canada",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Niagara Falls\/Fallsview Hotel & Suites offers breathtaking views of Niagara Falls from The Watermark restaurant"
  }, {
    "itemText": "Chad",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "The opening of Hilton N'Djamena marked Hilton's presence in 100 countries"
  }, {
    "itemText": "Chile",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "DoubleTree by Hilton Hotel Santiago - Vitacura offers stunning Andes Mountain views"
  }, {
    "itemText": "China",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Long Bar at Waldorf Astoria Shanghai is a restored version of the once world\u2019s longest bar, which measured 39 feet, and was carved out of raw mahogany"
  }, {
    "itemText": "Colombia",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "The first South American Embassy Suites opened in Bogota in December 1995"
  }, {
    "itemText": "Costa Rica",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Doubletree Resort by Hilton Central Pacific is an all inclusive resort complete with 13 bars and restaurants"
  }, {
    "itemText": "Croatia",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "Hilton Imperial Dubrovnik is a UNESCO World Heritage Site that offers stunning views over the medieval Old Town and Adriatic Sea"
  }, {
    "itemText": "Curacao",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "Hilton Curacao features an on-site diving program to explore the coral cover which is higher in Curacao than other Caribbean islands"
  }, {
    "itemText": "Cyprus",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "Hilton Cyprus is the only 5 star hotel in Nicosia"
  }, {
    "itemText": "Czech Republic",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "Hilton Old Town Prague is located in the center of Prague\u2019s most desirable attractions, including Old Town Square, Wenceslas Square and Charles Bridge"
  }, {
    "itemText": "Denmark",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "Hilton Copenhagen Airport has been awarded the Green Key Certificate for Environmental Awareness"
  }, {
    "itemText": "Dominican Republic",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "Embassy Suites by Hilton Santo Domingo is the tallest building in Santo Domingo, boasting incredible views over the Dominican Republic\u2019s vibrant capital city"
  }, {
    "itemText": "Ecuador",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "Hilton Colon Quito Hotel is ideally located in La Mariscal enternainment district, on Quito\u2019s bustling Avenida Amazonas"
  }, {
    "itemText": "Egypt",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Pyramids Golf Resort, a relaxed hotel just outside of Cairo, boasts stunning views of the Pyramids"
  }, {
    "itemText": "El Salvador",
    "itemImage": "/_assets/images/02.jpg",
    "itemFact": "The Hilton Princess San Salvador is one of the tallest buildings in the country at 61 metres"
  }, {
    "itemText": "Equatorial Guinea",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "Hilton Malabo was added in 2011 as Hilton's first property in Equatorial Guinea, in the same week that Hilton opened it's first property in Namibia"
  }, {
    "itemText": "Ethiopia",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "Hilton Addis Ababa, which is inspired by the famous Lalibella Cross Church, has a geo-thermal outdoor swimming pool and an 18-hole mini golf course"
  }, {
    "itemText": "Finland",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "The Hilton Helsinki Kalastajatorppa hotel overlooks the Gulf of Finland and often hosts meetings on the beach"
  }, {
    "itemText": "France",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "Trianon Palace Versailles, Waldorf Astoria Hotel is walking distance of the legendary Palace of Versailles"
  }, {
    "itemText": "French Polynesia",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "Hilton Bora Bora Nui Resort & Spa has its own private islet, which was once Polynesian Queen Pomare IV's private beach"
  }, {
    "itemText": "Georgia",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "Hilton's first property in Georgia, Hilton Batumi which overlooks the Black Sea, will soon be joined by the Hilton Garden Inn Tbilisi Chavchavadze in the heart of the financial district"
  }, {
    "itemText": "Germany",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "Freddy Mercury wrote \"Crazy little thing called love\" while in taking a bubble bath in a suite at Hilton Munich Park"
  }, {
    "itemText": "Greece",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Conrad Hilton attended the official opening of the Hilton Athens in 1963 which marked Athens' first international chain property"
  }, {
    "itemText": "Guam",
    "itemImage": "/_assets/images/02.jpg",
    "itemFact": "Hilton Guam Resort & Spa is situated on 32 acres of beachfront property with panoramic views of Tumon Bay"
  }, {
    "itemText": "Guatemala",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "Located in the financial and business district, the Hilton Garden Inn Guatemala City has outdoor gardens to accomodate up to 250 guests"
  }, {
    "itemText": "Honduras",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "The Mayan ruins of Copan and the beautiful beaches of the Bay of Cortes are a short drive away from the Hilton Princess San Pedro Sula"
  }, {
    "itemText": "Hong Kong",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "The Conrad Hong Kong houses six restaurants and bars, including a cake shop, brasserie and Michelin-starred Cantonese restaurant"
  }, {
    "itemText": "Hungary",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "Hilton Budapest is located in the Royal Castle District, a UNESCO World Heritage Site"
  }, {
    "itemText": "Iceland",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "Hilton Reykjavik Nordica is conveniently set in the city centre and the first Canopy by Hilton is set to open nearby in 2016"
  }, {
    "itemText": "India",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "Hilton Shillim Estate Retreat & Spa is an award-winning spa retreat with a Naturopathy specialist and nutritionist on site"
  }, {
    "itemText": "Indonesia",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "Guests of the Conrad Bali can engage in an authentic ancient purification ritual, Balinese arts and crafts, and traditional dancing"
  }, {
    "itemText": "Ireland",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "In 2013, DoubleTree by Hilton opened its first hotel in Ireland, The Morrison - a DoubleTree by Hilton (Dublin)"
  }, {
    "itemText": "Israel",
    "itemImage": "/_assets/images/02.jpg",
    "itemFact": "The Hilton Tel Aviv opened more than 50 years ago in 1963"
  }, {
    "itemText": "Italy",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "Mr. and Mrs. Joel Franken from Davenport, Iowa were welcome as the first guests at the Hilton Grand Vacations Club at Borgo alle Vigne"
  }, {
    "itemText": "Jamaica",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "Montego Bay's Hilton Rose Hall Resort & Spa is located on the legendary 18th-century Rose Hall Plantation"
  }, {
    "itemText": "Japan",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "At the Hilton Odawara Resort & Spa, children ages 4-12 can test themselves to see if they have what it takes to be a Hilton Odawara Ninja"
  }, {
    "itemText": "Jordan",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "Marvel at stunning Red Sea views from the edge of the infinity pool at DoubleTree by Hilton Hotel Aqaba "
  }, {
    "itemText": "Kazakhstan",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "The modern Hilton Garden Inn Astana, Hilton's only hotel in the Kazakhstan, boasts easy access to the city center"
  }, {
    "itemText": "Kenya",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "In addition to the Hilton Nairobi, a Hilton Garden Inn is scheduled to open near the Jomo Kenyatta International Airport"
  }, {
    "itemText": "Kuwait",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "The largest fountain in Kuwait can be found at Al-Kout Mall, just five minutes from the Hilton Kuwait Resort "
  }, {
    "itemText": "Lebanon",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Beirut Habtoor Grand boasts the Middle East's first Snow Room"
  }, {
    "itemText": "Luxembourg",
    "itemImage": "/_assets/images/02.jpg",
    "itemFact": "The DoubleTree by Hilton Hotel Luxembourg is just ten minutes from the European Court of Justice and European Commission"
  }, {
    "itemText": "Macao",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "The world\u2019s largest Conrad hotel is located in Macao"
  }, {
    "itemText": "Malaysia",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "Admire the tallest twin buildings in the world, Petronas Twin Towers, from DoubleTree by Hilton Kuala Lumpur  "
  }, {
    "itemText": "Maldives",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "Conrad Maldives Rangali Island features the\u00a0world's first and only all glass undersea restaurant"
  }, {
    "itemText": "Malta",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "Exchange your vows in full view of the deep azure of the Mediterranean Sea at Hilton Malta"
  }, {
    "itemText": "Mauritius",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "Hilton Mauritius Resort offers a serene and invigorating getaway on the beautiful beaches of Flic en Flac"
  }, {
    "itemText": "Mexico",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "In 2015 the Hilton Los Cabos Beach & Golf Resort reopened 10 months after being slammed by Hurricane Odile "
  }, {
    "itemText": "Myanmar",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "With five properties in the works, Hilton Worldwide is\u00a0committed to creating jobs and\u00a0partnerships in Myanmar"
  }, {
    "itemText": "Namibia",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Watch the sunset from the Hilton Windhoek's rooftop bar with panoramic views of the Namibian skyline"
  }, {
    "itemText": "Netherlands",
    "itemImage": "/_assets/images/02.jpg",
    "itemFact": "In 1969, John Lennon and Yoko Ono honeymooned in a Presidential Suite at Hilton Amsterdam"
  }, {
    "itemText": "New Caledonia",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "Hilton Noumea La Promenade Residences including a glass-walled chapel located in the gardens of the hotel with panoramic views over Anse Vata Bay"
  }, {
    "itemText": "New Zealand",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "Stay at the Hilton Queenstown\u00a0Resort and Spa\u00a0to discover why this city earned the title, 'Adventure capital of the world'"
  }, {
    "itemText": "Nicaragua",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "Take a trip to the near by Masaya's Volcano when staying at the Hilton Princess Managua"
  }, {
    "itemText": "Nigeria",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "Each year Transcorp Hilton Abuja participates in the World Wide Fund's Earth Hour initiative by switching off non-essential lighting for one hour"
  }, {
    "itemText": "Oman",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "With views of the Arabian Sea and dramatic Dhofar mountain range, Hilton Salalah Resort is the perfect place to relax and soak in the local\u00a0culture"
  }, {
    "itemText": "Panama",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "Hilton Panama is home to the first Ruth's Chris Steakhouse in Latin America"
  }, {
    "itemText": "Peru",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "The Hilton Garden Inn Cusco is the perfect starting point to explore the archaeological capital of the Americas"
  }, {
    "itemText": "Poland",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "The Hilton Gdansk is home to High 5 Terrace Bar, the highest bar in the Old Town with views of the Motlawa River"
  }, {
    "itemText": "Portugal",
    "itemImage": "/_assets/images/02.jpg",
    "itemFact": "DoubleTree by Hilton, Portugal donates extra food from their restaurant and events to over 40 disadvantaged families in their local community"
  }, {
    "itemText": "Puerto Rico",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "The\u00a0Pi\u00f1a Colada was invented at\u00a0the Caribe Hilton in San Juan. Cheers! "
  }, {
    "itemText": "Qatar",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "Hilton Doha works with The Youth Company, a large-scale youth engagement organization in Qatar, to provide leadership course training"
  }, {
    "itemText": "Republic of Fiji",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "The Hilton Fiji Beach Resort & Spa boasts a beachfront location on 1.5 km of stunning private beach"
  }, {
    "itemText": "Republic of Seychelles",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "DoubleTree Resort & Spa by Hilton Seychelles Allamanda features the Duniye Spa, perched on a large granite boulder, overlooking the Indian Ocean"
  }, {
    "itemText": "Romania",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "Built in 1914, the Athenee Palace Hilton Bucharest hotel is one of the city\u2019s most sophisticated and prestigious landmarks"
  }, {
    "itemText": "Russia",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "The Hilton Moscow Leningradskaya is listed as one of the historical monuments of Moscow"
  }, {
    "itemText": "Saudi Arabia",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "Waldorf Astoria Jeddah - Qasr al Sharq has a three-story Swarovski crystal chandelier suspended from the lobby"
  }, {
    "itemText": "Singapore",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Singapore is consistently ranked highly for their lushious cheesecake"
  }, {
    "itemText": "Slovakia",
    "itemImage": "/_assets/images/02.jpg",
    "itemFact": "DoubleTree by Hilton Hotel Bratislava is attached to Slovnaft Arena, where all KHL matches are played, as well as various concerts and performances"
  }, {
    "itemText": "South Africa",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "Hilton Cape Town City Center partners with a youth accommodation center to provide donated hotel items to furnish rooms for homeless youth"
  }, {
    "itemText": "South Korea",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "Spa treatments at the Hilton Namhae Golf and Spa Resort inspired by the ancient tradition of zimzilbang"
  }, {
    "itemText": "Spain",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "In December 2012, DoubleTree by Hilton entered the Iberian Peninsula with DoubleTree by Hilton Hotel & Spa Emporda on Spain's Costa Brava"
  }, {
    "itemText": "Sri Lanka",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "The Hilton Colombo is the only hotel in the city with a connective bridge to The World Trade Centre"
  }, {
    "itemText": "Sweden",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "The Hilton Stockholm is a short walk from Grona Lund, a 130 year-old amusement park"
  }, {
    "itemText": "Switzerland",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "Hilton Garden Inn Davos is located opposite Davos Congress Center \u2013 the host venue of the World Economic Forum every January"
  }, {
    "itemText": "Tanzania",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "Every room in the DoubleTree by Hilton Hotel - Dar es Salaam is decorated with traditional African arts and crafts"
  }, {
    "itemText": "Thailand",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "DoubleTree Resort Thailand designed a hydroponics farm to teach students how to build and manage a hydroponic farmstead"
  }, {
    "itemText": "Trinidad and Tobago",
    "itemImage": "/_assets/images/02.jpg",
    "itemFact": "The unique entrance to Hilton Trinidad Hotel & Conference Centre is located on the top floor and an elevator descends to the guest rooms which have private balconies overlooking 25 acres of lanscaped gardens"
  }, {
    "itemText": "Turkey",
    "itemImage": "/_assets/images/03.jpg",
    "itemFact": "The first international Hilton hotel opened outside the United States was the Hilton Istanbul Bosphorus"
  }, {
    "itemText": "Ukraine",
    "itemImage": "/_assets/images/04.jpg",
    "itemFact": "Hilton Kyiv created an Annual Hospitality Innovation Competition for the students of the neighboring Kyiv Universities"
  }, {
    "itemText": "United Arab Emirates",
    "itemImage": "/_assets/images/05.jpg",
    "itemFact": "Conrad Dubai features the only indoor vehicle elevator in the UAE"
  }, {
    "itemText": "United Kingdom",
    "itemImage": "/_assets/images/06.jpg",
    "itemFact": "The James Bond film \"Golden Eye\" was filmed at the Langham Hotel "
  }, {
    "itemText": "United States",
    "itemImage": "/_assets/images/07.jpg",
    "itemFact": "In 1919, Hilton's first hotel opened in Cisco, Texas"
  }, {
    "itemText": "Uruguay",
    "itemImage": "/_assets/images/08.jpg",
    "itemFact": "The ruins of an 18th century Spanish fortress is a short distance away from the Conrad Punta del Este Resort and Casino"
  }, {
    "itemText": "Venezuela",
    "itemImage": "/_assets/images/09.jpg",
    "itemFact": "Embassy Suites by Hilton Caracas is close to Centro Sambil which is among the largest shopping malls in South America with over 500 stores"
  }, {
    "itemText": "Vietnam",
    "itemImage": "/_assets/images/01.jpg",
    "itemFact": "Hilton Garden Inn Hanoi hotel the brand's first hotel in Southeast Asia"
  }
];


var pageData={
  testPage:{
    pageSections:[
      {
        sectionTitle: '',
        sectionType:'three-block'
      },
      {
        sectionTitle: 'hilton properties worldwide',
        sectionType:'grid',
        data: gridItems
      }
    ]
  }
};