// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

function Game() {

  this.state          = 'intro';
  this.max_screens    = 15;
  this.screens        = [];
  this.current_screen = 0;
  this.time           = 6000;
  this.chars          = ["noynoy","erap","villar","gibo","gordon","eddie"];
  this.char_numbers   = {"noynoy":0,"erap":0,"villar":0,"gibo":0,"gordon":0,"eddie":0};
  this.player_score   = 0;
  this.pcos_score     = 0;  
  this.ballot_range   = [ [10,10], [10,15], [12,15], [15, 20], [18,20], [20, 25], [25, 30], [30,35], [30,40], [35,40], [38,40], [38,40], [38,40], [38,40], [38,40] ];
  this.ballot_slots   = [];
  this.allow_input    = false;
  
  this.initialize = function() {
    this.initialize_behaviours();
    this.compute_ballot_slots();
  };
  
  this.show_help = function() {
    var game = this;
    
    $("#help").fadeIn(500);
    $(".bttn_ready","#help").click(function(){
      game.start();
    });
    
  };
  
  this.start = function() {
    //console.log("starting...");
    $("#intro").hide();
    $("#help").hide();
    $("#game").show();
    this.screens        = [];
    this.current_screen = 0;
    this.player_score   = 0;
    this.pcos_score     = 0;
    this.render_screen();
  };
  
  this.reset = function() {
    $("#intro").show();
    $("#game").hide();
    $("#results").hide();
    this.kill_timer();
    this.screens        = [];
    this.current_screen = 0;
    this.player_score   = 0;
    this.pcos_score     = 0;
  };
  
  this.render_screen = function() {
    
    this.screens.push( new Screen(this) );
    this.screens[this.current_screen].render();
    this.render_timer();
    
  };
    
  this.next_screen  = function() {

    this.screens[this.current_screen].clear();    

    if (this.current_screen+1 < this.max_screens) {
      this.current_screen+=1;
      this.render_screen();
    } else {
      this.tally_results();
    }
    
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
    var title   = $("<h1 class='title'>Poll Results</h1>").appendTo(results);
    var loading = $("<div></div>").text("TALLYING ...").addClass("tallying").appendTo(results);
    
    results.oneTime(3000, function(){ 
      loading.remove();
      
      var player_title  = $("<h3 class='player_title'>Your Score</h3>").appendTo(results);
      var pcos_title    = $("<h3 class='pcos_title'>PCOS' Score</h3>").appendTo(results);
      var player_result = $("<h1 class='player_score'></h1>").text( game.player_score + "/" + game.max_screens ).appendTo(results);
      var pcos_result   = $("<h1 class='pcos_score'></h1>").text( game.pcos_score + "/" + game.max_screens ).appendTo(results);
      var caption       = $("<p></p>").html( game.get_caption(game.player_score, game.pcos_score) ).addClass("caption").appendTo(results);
      
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
              name  : 'Are You Smarter Than a PCOS?',
              caption: 'Me vs. the PCOS Machine',
              description : ( "PCOS : " + game.pcos_score + " correct counts, ME : " + game.player_score + " correct counts"),
              href: 'http://pcos.syndeolabs.com/'
            },
            action_links: [
              { text: 'Die, PCOS!', href: 'http://pcos.syndeolabs.com/' }
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
  
  this.compute_ballot_slots = function() {
    var total_w   = 550; 
    var total_h   = 400;
    var max_slots = this.ballot_range[this.ballot_range.length-1][1];
    var step_w    = Math.round(total_w/6);
    var step_h    = Math.round(total_h/6);

    this.ballot_slots = [];
    for(var i=0; i<6; i++) {
      for(var j=0; j<6; j++) {
        this.ballot_slots.push([step_w*i, step_h*j]);
      }
    }
    
  };
  
  this.get_caption = function(player,pcos) {
    
    var win_captions  = ["Is your name Teddy Boy?", "Do you work for NAMFREL?", "Manual vote-counting FTW!", "Time to don that Koala mask, son."];
    var lose_captions = ["Go back to grade school, j3j3.", "Thank God for SmartMatic, yes?","You voted for Acosta, didn't you?","You are the reason Erap almost won."];
    
    if (player > pcos) {
      return "You had more correct answers than the PCOS! <br/>" + win_captions[Math.floor(Math.random()*win_captions.length)];
    } else if (player < pcos) {
      return "The PCOS Machine counted better than you! <br/>" + lose_captions[Math.floor(Math.random()*lose_captions.length)];
    } else {
      return "You are no better than the machine.";
    }
  };
}


function Screen(game, num) {

  this.game           = game;
  this.num            = game.current_screen;
  this.chars          = game.chars;
  this.char_numbers   = [["noynoy",0],["erap",0],["villar",0],["gibo",0],["gordon",0],["eddie",0]];
  this.ballots_dom    = false;
  this.answer         = false;
  this.ballots        = new Array();
  this.results        = false;
  this.ballot_slots   = [
    [306, 136], [308, 166], [345, 170], [344, 135], [346, 108], [307, 96], [274, 109], [253, 142], [258, 177], [291, 205],
    [337, 218], [389, 217], [412, 175], [399, 129], [388, 83], [343, 56], [286, 54], [235, 70], [206, 117], [205, 173], 
    [224, 215], [262, 248], [314, 272], [365, 267], [419, 254], [444, 212], [445, 154], [431, 97], [412, 47], [366, 22], 
    [244, 26], [179, 51], [156, 112], [156, 169], [161, 222], [204, 266], [252, 305], [321, 315], [394, 302], [470, 272], 
    [495, 214], [497, 159], [495, 93], [470, 46], [133, 33], [108, 78], [93, 138], [94, 204], [116, 261], [155, 302], 
    [510, 316], [550, 263], [565, 200], [563, 134], [550, 83], [525, 35], [590, 35], [613, 91], [615, 243], [608, 308], 
    [86, 311], [42, 269], [41, 176], [37, 90], [63, 38]
    ];
  this.player_response = false;
  this.pcos_response   = false;
  this.player_correct  = false;
  this.pcos_correct    = false;
  
  this.render = function() {
    
    this.ballots_dom  = $("<div></div>").attr("id","ballots").appendTo("#screen");
    var range         = this.game.ballot_range[this.num];
    var num_ballots   = range[0] + Math.round(Math.random()*(range[1]-range[0]));

    for(var i=0; i<num_ballots; i++) {
      var char = this.chars[Math.floor(Math.random()*(this.chars.length))];
      var ballot = $("<div></div>").addClass("candidate " + char).appendTo(this.ballots_dom);
      this.ballots.push(ballot);
      $.each(this.char_numbers,function(idx,char_arr){
        if (char_arr[0]==char) char_arr[1]+=1;     
      });
    }
    
    this.char_numbers.sort(function(a,b){ return b[1] - a[1]; });

    // let's make sure someone can win, yes?
    if (this.char_numbers[0][1] == this.char_numbers[1][1]) {
      for (var i=0; i<2; i++) {
        var ballot = $("<div></div>").addClass("candidate " + this.char_numbers[0][0]).appendTo(this.ballots_dom);
        this.ballots.push(ballot);
        this.char_numbers[0][1]+=1;
      }
    }
    
    //console.log(this.char_numbers);
    
    this.answer = this.char_numbers[0][0];
    
    this.render_question();
    this.render_ballots();
    this.render_controls();
    this.game.allow_input = true;
    
  };
  
  this.render_question = function() {
    
    $("<div></div>").attr("id","question").html("Who has more votes?").appendTo("#screen");
    //$("<div></div>").attr("id","question").html("How many votes for <strong>" + this.question + "</strong>?").appendTo("#screen");
    
  };
  
  this.render_ballots = function() {
    var screen = this;
    
    $.each(screen.ballots, function(idx,ballot){
      var slot_num = idx; //Math.round(Math.random()*screen.ballot_slots.length+1);
      var slot = screen.ballot_slots[slot_num];
      screen.render_ballot(ballot, slot);  
    });
  };
  
  this.render_ballot = function(ballot, pos) {

    var rand_mod = (6 + Math.random()*4)/10;
    var w = Math.round(50 * rand_mod);
    var h = Math.round(50 * rand_mod);
    var ol = pos[0];
    var ot = pos[1];
    var l = pos[0] - Math.round(w/2);
    var t = pos[1] - Math.round(h/2); 
       
    ballot.css({left: ol + "px", top: ot + "px", display:'block'}).animate({left: l + "px", top: t + "px", opacity:0.7, width : w + "px", height : h + "px"});
  
  };
  
  this.render_controls = function() {
    var screen = this;
    $("#controls").empty();
    var ul = $("<ul></ul>").appendTo("#controls");
    $.each(this.chars, function(idx,char){
      $("<li></li>").text(char).
        addClass(char).
        click(function(){
          if (screen.game.allow_input)
            screen.send_response(char);
        }).
        appendTo(ul);
    });
  };
  
  this.clear = function() {
    $("#screen").empty();
  };
  
  this.send_pcos_response = function() {
    //PCOS has 50% chance of being correct
    if(Math.random()*10 > 5) {
      this.pcos_response  = this.pcos_wrong_response();
      this.pcos_correct   = false;
    } else {
      this.pcos_response  = this.answer;
      this.pcos_correct   = true;
      this.game.pcos_score += 1;
    }
  };
  
  this.pcos_wrong_response = function() {
    for (var i=0; i < this.chars.length; i++) {
      if (this.chars[i]!=this.answer) {
        return this.chars[i];
      }
    }
  };
  
  this.send_response = function(char) {
    if (!this.player_response) {
      //console.log(char);
      
      this.player_response = char;
      if (this.player_response == this.answer) {
        this.player_correct = true
        this.game.player_score+=1;
      } else {
        this.player_correct = false;
      }
      //console.log(this.player_correct);
      
      this.send_pcos_response();
      this.show_result();
      this.game.kill_timer();
      this.game.allow_input=false;
    }
  };
  
  this.show_result = function() {
    var screen   = this;
    
    this.results = $("<div></div>").addClass("screen_results").appendTo("#screen");
    
    var player_title    = $("<h4></h4>").addClass("player_response_title").text("Your answer").appendTo(this.results);
    var pcos_title      = $("<h4></h4>").addClass("pcos_response_title").text("PCOS' answer").appendTo(this.results);
    
    if (this.player_response) {
      var player_response = $("<div></div>").addClass("player_response " + this.player_response).appendTo(this.results);
    } else {
      var player_response = $("<div></div>").addClass("player_response").text("?").appendTo(this.results);
    }
    
    var pcos_response   = $("<div></div>").addClass("pcos_response " + this.pcos_response).appendTo(this.results);
    
    var player_result   = $("<div></div>").addClass(this.player_correct ? "correct" :"incorrect").appendTo(player_response);
    var pcos_result     = $("<div></div>").addClass(this.pcos_correct ? "correct" :"incorrect").appendTo(pcos_response);
    
    var next_screen     = $("<div></div>").addClass("bttn_next_screen").text("NEXT SCREEN").click(function(){
      screen.game.next_screen();
    }).appendTo(this.results);
    
    var restart_game    = $("<div></div>").addClass("quit").text("Quit ...").click(function(){
      if(confirm("Are you sure you want to quit? These votes need to be counted!!!"))
        screen.game.reset();
    }).appendTo(this.results);
    
    this.results.show().animate({opacity:1.0},500,function(){
      player_result.fadeIn(500);
      pcos_result.fadeIn(500);
    });
  };
  
}
//$("#ballots").css("border","1px solid #000").click(function(e){ $("<div></div>").addClass('marker').css({width:'5px',height:'5px','background-color':'#000',left:(e.pageX-$(this).offset().left)+'px', top:(e.pageY-$(this).offset().top)+'px', position:'absolute'}).appendTo('#ballots'); console.log([e.pageX-$(this).offset().left,e.pageY-$(this).offset().top]); });



