$(window).on("scroll", function () {
  $(".scroll-blurred").each(function () {
    var offset = $(this).offset();
 
    // Change top to be the center of the element
    offset.top += $(this).outerHeight() / 2; 
 
    // Get the center of the screen
    var centerOfTheScreen = window.scrollY + $(window).height() / 2;
 
    // Check the distance between the center of the screen and out images
    var distanceFromCenter = Math.abs(centerOfTheScreen - offset.top);
    
    // Calculate the opacity with {BLUR_RANGE} pixels away being 1
    var opacity = Math.min(distanceFromCenter, BLUR_RANGE) / BLUR_RANGE;
 
    // Set the opacity (inverse last calculation so that it 
    // fades in as you approach the center)
    $(this).find(".img-crisp").css("opacity", 1 - opacity);
  });
});