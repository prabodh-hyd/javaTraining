package in.javaDemo;
import java.util.Scanner;
public class ticTacToe {
	
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Welcome to Tic Tac Toe!");
        System.out.print("Enter Player 1's name: ");
        String player1 = sc.nextLine();
        
        System.out.print("Enter Player 2's name: ");
        String player2 = sc.nextLine();
        char sybl1;
        char sybl2;
        
        //choosing the player symbol
        while (true) {
            System.out.print(player1 + ", do you want to be X or O? ");
            sybl1 = sc.next().toUpperCase().charAt(0);
            
            if (sybl1 == 'X' || sybl1 == 'O') {
                sybl2 = (sybl1 == 'X') ? 'O' : 'X';
                break; //breaking while loop
            } else {
                System.out.println("Invalid choice. Please choose X or O.");
            }
        }
        System.out.println(player1 + " is " + sybl1 + " and " + player2 + " is " + sybl2 + ".");
        
        //getting the grid for console
        char[][] matrix = {
            {'-', '-', '-'},
            {'-', '-', '-'},
            {'-', '-', '-'}
        };
        
        
        char currSybl = sybl1;
        String currply = player1;
        boolean gameEnd = false;

        while (!gameEnd) {
            printBoard(matrix);
            System.out.println(currply + ", enter your move (row and column: 0, 1, or 2):");

            int row = sc.nextInt();
            int col = sc.nextInt();

            if (row < 0 || row >= 3 || col < 0 || col >= 3 || matrix[row][col] != '-') 
                System.out.println("Invalid move. Try again.");
            else {
                matrix[row][col] = currSybl;
                gameEnd = checkWin(matrix, currSybl) || checkDraw(matrix);

                if (gameEnd) {
                    printBoard(matrix);
                    if (checkWin(matrix, currSybl)) {
                        System.out.println(currply + " wins!");
                    } else {
                        System.out.println("It's a draw!");
                    }
                } else {
                    currSybl = (currSybl == sybl1) ? sybl2 : sybl1;
                    currply = (currply.equals(player1)) ? player2 : player1;
                }
            }
        }

        sc.close();
    }

    static void printBoard(char[][] matrix) {
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                System.out.print(matrix[i][j] + " ");
            }
            System.out.println();
        }
    }

    static boolean checkWin(char[][] matrix, char sybl) {
        for (int i = 0; i < 3; i++) {
            if ((matrix[i][0] == sybl && matrix[i][1] == sybl && matrix[i][2] == sybl) || (matrix[0][i] == sybl && matrix[1][i] == sybl && matrix[2][i] == sybl)) {
                return true;
            }
        }
        return (matrix[0][0] == sybl && matrix[1][1] == sybl && matrix[2][2] == sybl) || (matrix[0][2] == sybl && matrix[1][1] == sybl && matrix[2][0] == sybl);
    }

    static boolean checkDraw(char[][] matrix) {
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (matrix[i][j] == '-') {
                    return false;
                }
            }
        }
        return true;
    }
}
