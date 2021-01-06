
var picCount = 0;



$("#submitButton").click(function() {

  console.log($("#uploadedFile")[0].files[0].size);
  if ($("#uploadedFile")[0].files[0].size === 0) {
    event.preventDefault();
  }
  else {

  picCount ++;
  var newCount = picCount;
  var prompt = "";

 console.log("pic count = " + picCount);
 console.log("new count = " + newCount);
  switch (picCount) {

    case 1 :

     prompt = "<h2>  Upload Front Facing After Picture </h2>"

    break;

    case 2 :

    prompt = "<h2 >  Upload Left Facing Before Picture   </h2>"

    break;

    case 3 :

    prompt = "<h2> Upload Left Facing After Picture    </h2>"

    break;

    case 4 :

    prompt = "<h2>  Upload Right Facing Before Picture   </h2>"

    break;

    case 5 :

    prompt = "<h2> Upload Right Facing After Picture  </h2>"

    break;

    case 6 :

    prompt = "<h2> Upload Back Facing Before Picture    </h2>"

    break;

    case 7 :

    prompt = "<h2>  Upload Back Facing After Picture   </h2>"
    break;

  }

  if (picCount === 8) {
  $("#cloudUpload").submit();
}
else {

$(".upload-prompt").html(prompt);

}
}
});


$("#resetButton").click(function() {
  event.preventDefault()
  var conVal = confirm("are you sure? your picures will be deleted and you will have to uplaod new ones.");
  if(conVal === false) {

  }
  else {
    $("#resetButton").submit();
  }
});




$('#code-button').click(function () {
$(".code-to-share").toggle();
});

$(".front").one("click",function() {
  $(".after-front").fadeIn(400);
  $(".after-info").fadeIn(400);
  $(".secret").fadeIn(400);
});

$(".l-side").one("click",function() {
  $(".after-side").fadeIn(400);
});

$(".r-side").one("click",function() {
  $(".after-side2").fadeIn(400);
});

$(".back").one("click",function() {
  $(".after-back").fadeIn(400);
});

$(".bf").one("click", function() {
  var magic = new Audio("Magic-wand-sound-effect.mp3");
  magic.play();
});
