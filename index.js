var buttonNum = 0;

//array of initial terms
var terms = [
    'dolphin',
    'shark',
    'barnacle',
    'urchin',
    'manatee',
]

//array to store favorited terms
var favTerms = [];
//parsed JSON array of favorited terms from localStorage
var localTerms = JSON.parse(localStorage.getItem('favTerms'));

//Picture element object constructor
var Picture = function (still, animated, n, b) {
    this.still = still;
    this.animated = animated;
    this.index = b;
    this.n = n;
    this.state = 'still';
    var $picEl = $("<img>").attr('src', this.still)
        .attr('id', "pic" + this.index + this.n)
        .addClass('picBox');
    this.picEl = $picEl;
    this.pop = function () {
        $picEl.prependTo('#board');
    }
    var $this = this;
    this.animate = function () {
        $this.picEl.on('click', function () {
            if ($this.state === 'still') {
                $this.state = 'animated';
                $this.picEl.attr('src', $this.animated)
                    .css('filter', 'drop-shadow(0px 0px 22px purple)');
            } else if ($this.state === 'animated') {
                $this.state = 'still';
                $this.picEl.attr('src', $this.still)
                    .css('filter', 'none');
            }
        })
    }
};

//button element object constructor, defines methods that .pop()ulate the screen with buttons and .handleClick()s.
var Button = function (word) {
    this.orig = false;
    this.text = word;
    this.num = buttonNum;
    this.clicked = 0;
    var $buttonEl = $("<button>").attr('id', this.text + this.num)
        .css('color', 'black')
        .html(word)
        .attr('class', 'button')
        .css('color', 'white');
    var $this = this;
    this.pop = function () {
        if ($this.orig === false && $this.favorited === true) {
            $buttonEl.css('background-color', 'navy');
        }
        $buttonEl.appendTo("#buttonRow");

    }
    this.handleClick = function () {
        var $buttonEl = $("#" + $this.text + $this.num);
        $buttonEl.on('click', function () {
            //if the button hasn't been clicked yet, its 'clicked' now = 1, and the gifs are grabEm()ed and put on the screen.
            if ($this.clicked === 0) {
                grabEm($this.text);
                $this.clicked = 1;
                $buttonEl.css('filter', 'drop-shadow(0px 0px 22px purple)');
                //if it's been clicked once, now clicked = 2 and the term is favorited & stored locally.
            } else if ($this.clicked === 1) {
                $this.clicked = 2;
                if ($this.orig === false) {
                    favTerms.push($this.text);
                    var stringedTerms = JSON.stringify(favTerms);
                    localStorage.setItem("favTerms", stringedTerms);
                    $buttonEl.css('filter', 'drop-shadow(0px 0px 22px yellow)');
                }
                //if it's already been favorited, nothing happens.
            } else if ($this.clicked === 2) {
                grabEm($this.text);
                return;
            }
        })
    }
}


//sends ajax request and populates the page with picture elements and begins listening for clicks on them elements.
function grabEm(input) {
    var limit = 10;

    $.ajax({
        url: "https://api.giphy.com/v1/gifs/search?q=" + input + "&api_key=AeQchigIEXfrl8UWsqzKZlYG3TaIyrZ6&limit=" + limit,
        method: 'GET'
    }).then(function (resp) {
        var results = resp.data;
        for (var i = 0; i < limit; i++) {
            var stillurl = results[i].images.original_still.url;
            var animatedurl = results[i].images.original.url;
            var b = buttonNum;
            var pic = new Picture(stillurl, animatedurl, i, b);
            pic.pop();
            pic.animate();
        }
    })
}

//function for initializing the buttons on the page, original and favorited
initializeButtons = function () {
    for (var c = 0; c < terms.length; c++) {
        var term = terms[c];
        if (term) {
            grabEm(term);
            var tb = new Button(term);
            tb.orig = true;
            tb.pop();
            tb.handleClick();
            buttonNum++;
        }
    }
    if (localTerms) {
        for (var d = 0; d < localTerms.length; d++) {
            var locTerm = localTerms[d];
            if (locTerm && !favTerms.includes(locTerm)) {
                favTerms.push(locTerm);
                var ltb = new Button(locTerm);
                ltb.orig = false;
                ltb.favorited = true;
                ltb.pop();
                ltb.handleClick();
            }
        }
    }
}

//listens for click event and searches based on user input.
$("#gifSearchButton").on('click', function (event) {
    event.preventDefault();
    var search = $("#searchBar").val().trim();
    if (search) {
        grabEm(search);
        var b = new Button(search);
        b.clicked = 1;
        b.pop();
        b.handleClick();
        $("#searchBar").val('');
    } else {
        return;
    }
})

$("#OK").on('click', function(){
    $("#instructions").hide();
})
$("#clearButton").on('click', function () {
    favTerms = [];
    localTerms = [];
    localStorage.clear();
    $("#buttonRow").empty();
    $("#board").empty();
    initializeButtons();
});

initializeButtons();