// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

function Game() {
  
  this.initialize = function() {
    var game          = this;
    game.started      = false;
    game.allow_input  = false;
    game.paused       = true;
    game.defeated     = false;
    game.limit        = 30000; //milliseconds
    game.score        = 60;
    game.steve        = new Steve(game);
    game.fireball     = new Fireball(game);
    game.input        = new Input(game);
    game.timer        = new Timer(game);
    
    game.steve.initialize();
    game.fireball.initialize();
    game.input.initialize();
    game.timer.initialize();
    
    game.show_hud("intro");
    $("#defeat").hide();
  };
  
  this.show_hud = function(page) {
    var game = this;
    $("#hud").show();
    $("#hud .content").html( $("#"+page).html() );
    if (page == "intro") {
      $(".help").unbind("click").click(function(){ game.show_hud("help"); });
    } else if (page == "help") {
      $(".start").unbind("click").click(function(){ game.start(); });
    } else if (page == "results") {
      $(".score").html("<strong>" + this.score + "</strong><span>emails sent!</span><span class='caption'>" + this.get_caption(this.score) + "</span>");
      $(".try_again").unbind("click").click(function(){ game.reset(); });
      this.initialize_sharing();
    }
  };
  
  this.hide_hud = function() {
    $("#hud").hide();
  };
  
  this.start = function() {
    this.hide_hud();
    $("#game").show();
    this.render();
  };

  this.pause = function() {
    console.log("PAUSED!");
    this.allow_input = false;
    this.paused      = true;
    this.fireball.stop();
  };

  this.resume = function() {  
    this.allow_input = true;
    this.paused      = false;
    this.start_typing();
  };
  
  this.start_typing = function() {
    this.paused = false;
    this.fireball.start();
  };
  
  this.stop_typing = function() {
    this.fireball.stop();
  };

  this.stop  = function() {
    $("#game").hide();
    this.show_hud("results");
    this.allow_input = false;
    this.steve.stop();
    this.fireball.stop();
    this.timer.stop();
  };
    
  this.defeat = function() {
    if (this.defeated==false) {
      var game = this;
      $("#game").hide();
      $("#defeat").show();
      $(".try_again").unbind("click").click(function(){ game.reset(); });
      this.defeated     = true;
      this.allow_input  = false;
      this.steve.stop();
      this.steve.angry();
      this.fireball.stop();
      this.timer.stop();      
    }
  };
  
  this.reset = function() {    
    this.initialize();
  };
  
  this.render = function() {
    this.allow_input = true;
    this.steve.render();
    this.input.render();
    this.timer.render();
  };
  
  this.increment_score = function() {
    $("#email_sent").animate({opacity:1.0},300,function(){ $(this).css("opacity",0.0); });
    this.score+=1;
  };
  
  this.initialize_sharing = function() {
    var game = this;
      
    $(".share").click(function(){
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

  };
  
  this.initialize_behaviours = function() {
    var game = this;
    $("#bttn_play").click(function(){
      game.show_help();
      $("#intro").fadeOut();
    });
  };
  
  this.get_caption = function(score) {
    
    if (score > 70) {
      return "Is that you, Gruber?";
    } else if (score > 50 && score <= 69) {
      return "You're an Apple Genius!";
    } else if (score > 40 && score <= 49) {
      return "You took the words right out of Steve's mouth.";
    } else if (score > 30 && score <= 39) {
      return "Not bad, for a dog.";
    } else if (score > 20 && score <= 29) {
      return "You've been spending too much time with Outlook.";
    } else if (score > 10 && score <= 19) {
      return "Type faster, Fireball!";
    } else if (score > 5 && score <= 9) {
      return "Too slow, Fireball. Keep trying."
    } else if (score < 4) {
      return "You're a Flash fan aren't you?";
    }
    
  };
}

function Fireball(game) {
  this.game           = game;
  this.dom            = $("#fireball");
  this.ipad_dom       = $("#ipad");
  this.animating      = false;
  this.classes        = ["typing_1","typing_2","typing_3"];
  this.current_class  = 0;
  
  this.initialize     = function() {
    
  };
  this.render = function() {
    var fb = this;
    fb.dom.show().attr("class","");
    fb.start();
  };
  this.start = function() {
    this.ipad_dom.addClass("on");
    if (this.current_class+1<this.classes.length) {
      this.current_class += 1;
    } else {
      this.current_class = 0;
    }
    var css = this.classes[this.current_class]
    this.dom.attr("class"," ").addClass(css);
  };
  this.stop = function() {
    this.animating = false;
    this.defeated  = false;
    this.ipad_dom.removeClass("on");
    this.dom.stopTime();
    this.dom.attr("class"," ");
  };
};

function Steve(game) {
  this.game           = game;
  this.dom            = $("#steve");
  this.dom_head       = $("#steve_head");
  this.dom_angry      = $("#steve_angry");
  this.animating      = false;
  this.state          = "asleep";
  this.classes        = ["snoring_1","snoring_2"];
  this.current_class  = 0;
  
  this.initialize = function() {
    this.dom.show().attr("class","").stopTime();
    this.dom_angry.hide().stopTime();
  };
  this.render = function() {
    this.start();  
  };
  this.start = function() {
    var st   = this;
    if (this.animating==false){
      this.animating = true;
      this.dom_head.
        stopTime().
        everyTime(1200,function(){
          var r = Math.random();
          if (r>0.8) {
            console.log("WAKING UP ...");
            $(this).stopTime().removeClass(st.classes.join(" "));
            st.wakeup();
          } else {
            if (st.current_class+1<st.classes.length) {
              st.current_class += 1;
            } else {
              st.current_class = 0;
            }          
            var css = st.classes[st.current_class]
            st.dom_head.attr("class"," ").addClass(css);
          }
      });
    }
  };
  this.stop = function() {    
    this.animating=false;
    this.dom_head.stopTime();
  };
  this.wakeup = function() {
    var st            = this;
    var steps         = 0;
    var search_start  = 5;
    var search_end    = 15;
    st.animating      = false;
    
    st.dom_head.
      css("class","").
      addClass("half_awake_1").
      everyTime(200,function(){
        $(this).toggleClass("half_awake_1").toggleClass("half_awake_2");
        if (steps < search_start) {
          //console.log(steps + " STARTING TO SEARCH ...");
        } else if (steps>=search_start && steps<=search_end) {
          //console.log(steps + " SEARCHING...");
          if (st.game.paused==false) st.game.defeat();        
        } else if (steps>search_end) {
          //console.log(steps + " STOPPING...");
          $(this).removeClass("half_awake_1").removeClass("half_awake_2");
          $(this).stopTime();
          st.start();
        }
        steps+=1;
      });
  };
  this.angry = function() {
    this.dom_angry.css({top:"50%", left:"50%", width:"10px", height:"10px"})
      .animate({top:"20%",left:"32%",width:"220px",height:"314px"},1000)
      .everyTime(100,function(){
        if ($(this).attr("src").indexOf("_1")!=-1) {
          $(this).attr("src","/images/steve_angry_2.png");
        } else {
          $(this).attr("src","/images/steve_angry_1.png");
        }
    });
  };
};

function Input(game) {
  this.game      = game;
  this.dom       = $("#input");
  this.animating = true;
  this.phrases   = ["That's coming soon!", "Sorry, no.", "We're working on it.", "We are all over this.", "Not a chance.", 
  "You won't be disappointed.", "Freedom from porn.", "Yup.", "Nope.", "H.264 is great.", "Sorry for the delay.", "Are you nuts?",
  "Yep.", "Not to worry.", "This problem is behind us.", "Not that big of a deal.", "Sounds like it's your fault.", 
  "We respect Adobe, just not Flash.", "iPhone OS4 has that!", "HTML5 is the future.", "Blame Google." ];
  this.current_phrase = false;
  this.num_keys       = 0;
  
  this.initialize = function() {
    var input = this;
    $(document).keyup(function(event){ input.new_key(event.keyCode); });
    this.new_phrase();
  };
  this.new_key  = function(keyCode) {
    if (keyCode == 27) { //Esc      
      this.game.pause();
    } else {
      if (this.num_keys<this.current_phrase.length) {
        this.game.start_typing();
        this.num_keys+=1;
        this.dom.html( this.current_phrase.substr(0,this.num_keys) );
      } else {
        this.game.increment_score();
        this.num_keys = 0;
        this.dom.html("");
        this.new_phrase();
      }    
    }
  };
  this.new_phrase = function() {
    this.current_phrase = this.phrases[Math.floor(Math.random()*(this.phrases.length-1))];
  };
  this.render = function() {
  
  };
  this.start = function() {
  
  };
  this.stop = function() {
  
  };
};

function Timer(game) {
  this.game      = game;
  this.dom       = $("#timer");
  this.animating = true;
  this.limit     = game.limit;
  
  this.initialize = function() {
    this.dom.removeClass("urgent").text(Math.round(this.limit/1000));
    this.stop();
  };
  this.render = function() {
    this.start();
  };
  this.start = function() {
    var timer = this;
    this.dom.stopTime().everyTime(1000,function(){
      var t = Number(timer.dom.text());
      if (t<11) { 
        if (t==1) {
          timer.stop();
          timer.game.stop();
        } else {
          t = "0" + (t-1); 
          timer.dom.addClass("urgent");        
        }
      } else { 
        t-=1; 
      };
      timer.dom.text(t);
      
    }, this.limit/1000);
  };
  this.stop = function() {
    this.dom.stopTime();  
  };
};
