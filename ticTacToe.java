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

        // Choosing the player symbol
        while (true) {
            System.out.print(player1 + ", do you want to be X or O? ");
            sybl1 = sc.next().toUpperCase().charAt(0);

            if (sybl1 == 'X' || sybl1 == 'O') {
                sybl2 = (sybl1 == 'X') ? 'O' : 'X';
                break;
            } else {
                System.out.println("Invalid choice. Please choose X or O.");
            }
        }

        System.out.println(player1 + " is " + sybl1 + " and " + player2 + " is " + sybl2 + ".");

        // Creating the game board
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

            try {
                int row = sc.nextInt();
                int col = sc.nextInt();

                // Attempting to access the array; this may throw ArrayIndexOutOfBoundsException
                if (matrix[row][col] != '-') {
                    System.out.println("Cell already taken. Try again.");
                } else {
                    matrix[row][col] = currSybl;

                    // Check if the game ends
                    if (checkWin(matrix, currSybl)) {
                        printBoard(matrix);
                        System.out.println(currply + " wins!");
                        gameEnd = true;
                    } else if (checkDraw(matrix)) {
                        printBoard(matrix);
                        System.out.println("It's a draw!");
                        gameEnd = true;
                    } else {
                        // Switch players
                        currSybl = (currSybl == sybl1) ? sybl2 : sybl1;
                        currply = (currply.equals(player1)) ? player2 : player1;
                    }
                }
            } catch (ArrayIndexOutOfBoundsException e) {
                System.out.println("Invalid move. Row and column must be between 0 and 2. Try again.");
            } catch (Exception e) {
                System.out.println("Invalid input. Please enter numeric values for row and column.");
                sc.next(); // Clear invalid input
            }
        }

        System.out.println("Game Over. Thanks for playing!");
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
            if ((matrix[i][0] == sybl && matrix[i][1] == sybl && matrix[i][2] == sybl) ||
                (matrix[0][i] == sybl && matrix[1][i] == sybl && matrix[2][i] == sybl)) {
                return true;
            }
        }
        return (matrix[0][0] == sybl && matrix[1][1] == sybl && matrix[2][2] == sybl) ||
               (matrix[0][2] == sybl && matrix[1][1] == sybl && matrix[2][0] == sybl);
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
