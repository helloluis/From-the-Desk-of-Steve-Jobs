// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

function Game() {


  this.started     = false;
  this.allow_input = false;
  
  this.initialize = function() {
    this.initialize_behaviours();
    // dont forget the preloader
  };
  
  this.show_help = function() {
    var game = this;
    
    $("#help").fadeIn(500);
    $(".bttn_ready","#help").click(function(){
      game.start();
    });
    
  };
  
  this.start = function() {
    $("#intro").hide();
    $("#help").hide();
    $("#game").show();

    this.render_screen();
  };
  
  this.reset = function() {
    $("#intro").show();
    $("#game").hide();
    $("#results").hide();
    this.kill_timer();

  };
  
  this.render_timer  = function() {
    var g = this;
    var t = $("#timer");
    var b = $("#timer_bar").
      css({"width":"480px"}).
      animate({ width:"0px" }, { 
        duration : g.time, 
        easing   : "linear",
        complete : function(){
          g.allow_input = false;
          if (!g.screens[g.current_screen].player_response) {
            g.screens[g.current_screen].send_pcos_response();
            g.screens[g.current_screen].show_result();          
          }
        }
      });
  };
  
  this.kill_timer = function() {
    $("#timer_bar").stop(true,false);
  }
  
  this.tally_results = function() {
    var game    = this;
    
    $("h3","#results").remove();
    $("h1","#results").remove();
    $("p","#results").remove();
    
    var results = $("#results").fadeIn(500);
    var title   = $("<h1 class='title'>GAME OVER!</h1>").appendTo(results);
    
    results.oneTime(3000, function(){ 
      loading.remove();
      
      var try_again     = $("<div></div>").addClass("bttn_restart").text("TRY AGAIN").click(function(){
        results.fadeOut(500);
        game.start();
      }).appendTo(results);
      
      var restart_game  = $("<div></div>").addClass("quit").text("Quit ...").click(function(){
          game.reset();
      }).appendTo(results);
      
      $("#share","#results").click(function(){
        FB.ui({
            method    : 'stream.publish',
            attachment: {
              name  : 'From the Desk of Steve Jobs',
              caption: 'I wrote ' + game.score + ' emails from the desk of Steve Jobs!',
              description : ( game.score + " emails sent in " + game.max_time + " seconds, averaging " + (game.score/game.max_time) + " emails/second." ),
              href: 'http://stevejobs.syndeolabs.com/'
            },
            action_links: [
              { text: 'Go, Fireball!', href: 'http://stevejobs.syndeolabs.com/' }
            ]
          },
          function(response) {
            if (response && response.post_id) {
              alert('Post was published.');
            } else {
              alert('Post was not published.');
            }
          }
        );
      }); 

    });
    
  };
  
  this.initialize_behaviours = function() {
    var game = this;
    $("#bttn_play").click(function(){
      //console.log("starting...");
      game.show_help();
      $("#intro").fadeOut();
    });
  };
  
  this.get_caption = function() {
    
    var win_captions  = ["Is that you, Gruber?","The real Fake Steve is in da house!","You took the words right out of Steve's mouth."];
    var lose_captions = ["You're a Flash fan aren't you?", "You've been spending too much time with Outlook, son.", "Go back to designing magic mice."];
    
    if (this.score > this.goal) {
      return win_captions[Math.floor(Math.random()*win_captions.length)];
    } else if (this.score < this.goal) {
      return lose_captions[Math.floor(Math.random()*lose_captions.length)];
    } else {
      return "Your AppleTV team needs you.";
    }
  };
}