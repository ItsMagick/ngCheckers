/* ------------------------------------------------------------------------------------------ */
/*                                 Functions of the Checkers                                  */
/* ------------------------------------------------------------------------------------------ */

angular.module("ngCheckers", [])

  // The controller id handles every function inside the html along with angular
  // The scope gives us access to everything that is in the DOM
  .controller("checkersCtrl", function ($scope, $timeout) {
    var RED = "Red",
      BLACK = "Black",
      BOARD_WIDTH = 8,
      selectedSquare = null,
        interval = null,
        timeSec = null;
    $scope.user = window.prompt("If you want to save your score, then please enter your username:");
    $scope.places = [{name:"", score:0},{name:"", score:0},{name:"", score:0}];

    // Setters of the checker pieces
    // Piece() will only be activated when being called in the scope functions
    function Piece(player, x, y) {
      this.player = player;
      this.x = x;
      this.y = y;
      this.isKing = false;
      this.isChoice = false;
      this.matados = [];
    }

    // Reseting the board
    $scope.newGame = function () {
      $scope.player = RED;
      $scope.redScore = 0;
      $scope.blackScore = 0;
      $scope.score = 0;

      $scope.board = [];
      for (var i = 0; i < BOARD_WIDTH; i++) {
        $scope.board[i] = [];
        for (var j = 0; j < BOARD_WIDTH; j++) {
          // Chips layout
          // Layout for the first row  ||   Layout for the 2nd row ||  Layout for the 3rd row 
          if ((i === 0 && j % 2 === 0) || (i === 1 && j % 2 === 1) || (i === 2 && j % 2 === 0)) {
            $scope.board[i][j] = new Piece(BLACK, j, i);
          } 
          //  Layout for the chips on the 2nd last row    ||  Layout for the chips on the last row  || Layout for the chips on the 3rd last row
          else if ((i === BOARD_WIDTH - 1 && j % 2 === 1) || (i === BOARD_WIDTH - 2 && j % 2 === 0) || (i === BOARD_WIDTH - 3 && j % 2 === 1)) {
            $scope.board[i][j] = new Piece(RED, j, i);
          } 
          else {
            $scope.board[i][j] = new Piece(null, j, i);
          }
        }
      }
    }

    // Initiate the function
    $scope.newGame();

    $scope.saveScore = function(){

        fetch('checkersAPI.php', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: "name=somethingnice&score="+$scope.score
        })
    }
    $scope.getScore = function() {
        //json encoded obj body
        fetch('checkersAPI.php').then(response => response.json()).then(data=> $scope.places = data);
    }
        //instead of this crap just get the mouseclick interaction from enter name popup
     // setTimeout(function (){document.getElementById("getScore").click()}, 3000)


    $scope.setStyling = function (square) {
        var pawnRED = "#FF0000",
            pawnBLACK = "#000",
            kingRED = "#FF4444",
            kingBLACK = "#444";
        // Red checker pieces
      if (square.player === RED)
          // If the chip became king, it will change to a different color.
        return {"backgroundColor": square.isKing ? kingRED : pawnRED};
        // Black checker pieces
      else if (square.player === BLACK)
        return {"backgroundColor": square.isKing ? kingBLACK : pawnBLACK};
      else
        return {"backgroundColor": "none"};
    }

    $scope.setClass = function (square) {
        var softBlack = '#00000088',
            softRed = '#FF000000';
      if (square.y % 2 === 0) {
        // Even rows (0, 2, 4, 6, 8)
        if (square.x % 2 === 0) {
          // Return black squares
          return {
            "backgroundColor": square.isChoice ? "yellow" : softBlack
          };
        } else {
          // Return red squares
          return {
            "backgroundColor": softRed
          };
        }
      } else {
        // Odd rows (1, 3, 5, 7)
        if (square.x % 2 === 1) {
          // Return black squares
          return {
            "backgroundColor": square.isChoice ? "yellow" : softBlack
          };
        } else {
          // Return red squares
          return {
            "backgroundColor": softRed
          };
        }
      }
    }

    // When a square is being clicked
    $scope.select = function(square) {
        if(timeSec == 0){
            startTimer();
        }

        // Check if the clicked square does have a chip AND it is your turn
        if (selectedSquare !== null && !square.player){
            movePiece(square);       // Move the piece to any of the designated highlighted areas
            resetChoices();          // Reset the highlighting
        }
        // Check to see if the chip is the user's
        else if(square.player === $scope.player){
            selectedSquare = square; // Duplicates the information the previous area that was clicked
            resetChoices();          // Reset the highlighting
            setChoices(selectedSquare.x, selectedSquare.y, 1, [], -1, -1, selectedSquare.isKing)
        }
        else {
            selectedSquare = null;   // Remains having no chip in the square
        }
      console.log($scope.board);
    }
    
    function movePiece(square){
        if (square.isChoice) {
            var becomeKing = selectedSquare.isKing;

            for (var i = 0; i < square.matados.length; i++) {
                var matado = square.matados[i];
                hopPiece(matado);
                //becomeKing = becomeKing || becomeKingAfterJump(matado.x, matado.y);

            }
            square.player = selectedSquare.player;
            square.isKing = becomeKing || isKing(square);

            selectedSquare.player = null;
            selectedSquare.isKing = false;

            // Check to see if the player is RED. If it was, turn to BLACK's turn.
            $scope.player = $scope.player === RED ? BLACK : RED;
/*
            if ($scope.player === BLACK) {
                for (var i = 0; i < BOARD_WIDTH; i++) {
                    for (var j = 0; j < BOARD_WIDTH; j++) {
                        if (square.player === $scope.player) {
                            $scope.select($scope.player);
                            if ($scope.board[i + 1][j + 1] === null) {

                                movePiece($scope.board[i + 1][j + 1]);
                                $scope.player = $scope.player === BLACK ? RED : BLACK;
                            } else {

                                movePiece($scope.board[i - 1][j + 1]);
                                $scope.player = $scope.player === BLACK ? RED : BLACK;

                            }
                        }
                    }
                }
            }

 */
        }
    }


    function resetChoices() {
        // Un-highlights everything
        // Constructed to iterate through the entire game board
        for (var i = 0; i < BOARD_WIDTH; i++){
            for (var j = 0; j <BOARD_WIDTH; j++){
                $scope.board[i][j].isChoice = false;
                $scope.board[i][j].matados = [];
            }
        }
    }
    
    function hopPiece(opponent) {
      opponent.player = null;   // Removes the piece from the board
        // If the RED player takes a BLACK chip
      if ($scope.player === RED) {
        $scope.redScore++;      // Add to Red's score
      }
        // If the BLACK player takes a RED chip
      else {
        $scope.blackScore++;  // Add to Black's score
      }
		gameOver();
    }

    
    function isKing(square) {
        if ($scope.player === RED){
            if (square.y === 0)
                return true;
        }
        else {
            if (square.y === BOARD_WIDTH - 1){
                return true;
            }
        }
        return false;
    }
    
    function setChoices(x, y, depth, matados, oldX, oldY, isKing){
        // Highlights the selected chip piece depending on the player's turn
        if (depth > 10) return;
        isKing =
            isKing ||
            ($scope.player === RED && y === 0) ||
            ($scope.player === BLACK && y == BOARD_WIDTH - 1);
        
        
//        ------------------------------------------------
//      |-|                 RED MOVES                    |--------------------------------------------------------|
//        ------------------------------------------------
        // The RED pieces will move diagonally UPWARDS.
        if ($scope.player === RED || isKing) {
            // Check to see if the player can move on the LEFT side of the board
            if (x > 0 && y > 0){
                var UP_LEFT = $scope.board[y-1][x-1] // It will focus on the square diagonally top left
                if (UP_LEFT.player){
                    if (UP_LEFT.player !== $scope.player) {
                        if ((x > 1 && y > 1) && !(x - 2 === oldX && y - 2 === oldY)){
                            var UP_LEFT_2 = $scope.board[y-2][x-2];
                            if (!UP_LEFT_2.player){
                                UP_LEFT_2.isChoice = true;
                                var jumpers = matados.slice(0);
                                if (jumpers.indexOf(UP_LEFT) === -1){
                                    jumpers.push(UP_LEFT);
                                }
                                UP_LEFT_2.matados = jumpers;
                                setChoices(x-2, y-2, depth+1, jumpers, x, y, isKing);
                            }
                        }
                    }
                }
                else if (depth === 1){
                    UP_LEFT.isChoice = true;
                }
            }
            
            // Difference between left and right (-x = left & +x = right)
            // Check to see if the player can move on the RIGHT side of the board
            if (x < BOARD_WIDTH - 1 && y > 0){
                var UP_RIGHT = $scope.board[y-1][x+1]; // It will focus on the square diagonally top right
                if (UP_RIGHT.player){
                    if (UP_RIGHT.player !== $scope.player) {
                        if ((x < BOARD_WIDTH - 2 && y > 1) && !(x + 2 === oldX && y - 2 === oldY)){
                            var UP_RIGHT_2 = $scope.board[y-2][x+2];
                            if (!UP_RIGHT_2.player){
                                UP_RIGHT_2.isChoice = true;
                                var jumpers = matados.slice(0);
                                if (jumpers.indexOf(UP_RIGHT) === -1){
                                    jumpers.push(UP_RIGHT);
                                }
                                UP_RIGHT_2.matados = jumpers;
                                setChoices(x+2, y-2, depth+1, jumpers, x, y, isKing);
                            }
                        }
                    }
                }
                else if (depth === 1){
                    UP_RIGHT.isChoice = true;
                }
            }
        }
        
//      |-----------------------------------------------------------------------------------------------------------|
        
//        ------------------------------------------------
//      |-|                 BLACK MOVES                  |----------------------------------------------------------|
//        ------------------------------------------------
        // The BLACK pieces will move diagonally DOWNWARDS.
        if ($scope.player === BLACK || isKing) {
            // Check to see if the player can move on the LEFT side of the board
            if (x > 0 && y < BOARD_WIDTH - 1){
                var DOWN_LEFT = $scope.board[y+1][x-1] // It will focus on the square diagonally down left
                if (DOWN_LEFT.player){
                    if (DOWN_LEFT.player !== $scope.player) {
                        if ((x > 1 && y < BOARD_WIDTH - 2) && !(x - 2 === oldX && y + 2 === oldY)){
                            var DOWN_LEFT_2 = $scope.board[y+2][x-2];
                            if (!DOWN_LEFT_2.player){
                                DOWN_LEFT_2.isChoice = true;
                                var jumpers = matados.slice(0);
                                if (jumpers.indexOf(DOWN_LEFT) === -1){
                                    jumpers.push(DOWN_LEFT);
                                }
                                DOWN_LEFT_2.matados = jumpers;
                                setChoices(x-2, y+2, depth+1, jumpers,x,y, isKing);
                            }
                        }
                    }
                }
                else if (depth === 1){
                    DOWN_LEFT.isChoice = true;
                }
            }
            
            // Difference between left and right (-x = left & +x = right)
            // Check to see if the player can move on the RIGHT side of the board
            if (x < BOARD_WIDTH - 1 && y < BOARD_WIDTH - 1){
                var DOWN_RIGHT = $scope.board[y+1][x+1]; // It will focus on the square diagonally down right
                if (DOWN_RIGHT.player){
                    if (DOWN_RIGHT.player !== $scope.player) {
                        if ((x < BOARD_WIDTH - 2 && y < BOARD_WIDTH - 2) && !(x + 2 === oldX && y + 2 === oldY)){
                            var DOWN_RIGHT_2 = $scope.board[y+2][x+2];
                            if (!DOWN_RIGHT_2.player){
                                DOWN_RIGHT_2.isChoice = true;
                                var jumpers = matados.slice(0);
                                if (jumpers.indexOf(DOWN_RIGHT) === -1){
                                    jumpers.push(DOWN_RIGHT);
                                }
                                DOWN_RIGHT_2.matados = jumpers;
                                setChoices(x+2, y+2, depth+1, jumpers, x, y, isKing);
                            }
                        }
                    }
                }
                else if (depth === 1){

                    DOWN_RIGHT.isChoice = true;
                }
            }
        }
//      |-----------------------------------------------------------------------------------------------------------|
    }
      function startTimer(){
          interval = setInterval(function (){
              $scope.$apply(function(){
                  timeSec += 1;
                  $scope.hours = correctInt(parseInt(timeSec / 3600, 10));
                  $scope.minutes = correctInt(parseInt(timeSec % 3600 / 60, 10));
                  $scope.seconds = correctInt(parseInt(timeSec % 60, 10));
              })
          }, 1000);
      }
	
	function gameOver(){
        // Game is over when one of the players has gotten 12 points
        // They are only 12 pieces for each player
		if($scope.redScore == 12)
			{
				alert("RED PLAYER WINS!!");
				$scope.newGame();
			}
		else if($scope.blackScore == 12)
			{
				alert("BLACK PLAYER WINS!!");
				$scope.newGame();
			}
	}
  });