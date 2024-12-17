package in.prabodh;

import java.util.Random;
import java.util.Scanner;

public class TicTacToe {
    static int choice1, choice2;
    static String user1, user2;
    static int[] choices = {6, 9, 4, 2, 3, 6, 7, 8, 9};
    boolean win1 = false;
    boolean win2 = false;

    public static void main(String[] args) {
        TicTacToe ticTacToe = new TicTacToe();
        ticTacToe.welcome();
        ticTacToe.gameStart();
    }

    public void welcome() {
        Scanner scanner = new Scanner(System.in);
        Random rand = new Random();
        System.out.println("""
                ╭━━━━╮╱╱╱╭━━━━╮╱╱╱╱╱╭━━━━╮
                ┃╭╮╭╮┃╱╱╱┃╭╮╭╮┃╱╱╱╱╱┃╭╮╭╮┃
                ╰╯┃┃┣╋━━╮╰╯┃┃┣┻━┳━━╮╰╯┃┃┣┻━┳━━╮
                ╱╱┃┃┣┫╭━╯╱╱┃┃┃╭╮┃╭━╯╱╱┃┃┃╭╮┃┃━┫
                ╱╱┃┃┃┃╰━╮╱╱┃┃┃╭╮┃╰━╮╱╱┃┃┃╰╯┃┃━┫
                ╱╱╰╯╰┻━━╯╱╱╰╯╰╯╰┻━━╯╱╱╰╯╰━━┻━━╯
                """);
        System.out.println("Welcome to Tic Tac Toe!");
        System.out.println("Enter your name for player 1: ");
        String player1 = scanner.nextLine();
        System.out.println("Enter your name for player 2: ");
        String player2 = scanner.nextLine();
        System.out.println("Player 1: " + player1 + ", Player 2: " + player2);
        System.out.println("System will pick a random player to choose first.");
        int random = rand.nextInt(2);
        if (random == 1) {
            System.out.println("Enter your choice for " + player1 + " (Number '1' for 'X' or Number 'O' for 'O'): ");
            choice1 = scanner.nextInt();
            if (choice1 == 1) {
                choice2 = 0;
            } else {
                choice2 = 1;
            }
        } else {
            System.out.println("Enter your choice for " + player2 + " (Number '1' for 'X' or Number 'O' for 'O'): ");
            choice2 = scanner.nextInt();
            if (choice2 == 1) {
                choice1 = 0;
            } else {
                choice1 = 1;
            }
        }
        user1 = player1;
        user2 = player2;
    }

    public void gameStart() {
        Scanner scanner = new Scanner(System.in);
        String[] characters = {"O", "X"};
        boolean invalid = false;
        String ascii = """
                             |            |
                      1      |     2      |       3
                             |            |
                _____________|____________|_____________
                             |            |
                      4      |      5     |       6
                             |            |
                _____________|____________|_____________
                             |            |
                      7      |      8     |       9
                             |            |
                             |            |""";
        System.out.println("Choose a position where you want to mark your choice, eg. choosing '1' when prompted will mark your character in that square.");
        System.out.println(ascii);
        for (int i = 0; i < 10;) {
            System.out.println(user1 + " Where to do you want to mark? ");
            int game1 = scanner.nextInt();
            if (choices[game1 - 1] == 0 | choices[game1 - 1] == 1) {
                System.out.println("That position is already marked. Choose another square.");
                invalid = true;
            }
            while(invalid) {
                game1 = scanner.nextInt();
                if (choices[game1 - 1] != 0 & choices[game1 - 1] != 1) {
                    invalid = false;
                }
            }
            choices[game1 - 1] = choice1;
            String str1 = Integer.toString(game1);
            ascii = ascii.replace(str1, characters[choice1]);
            System.out.println(ascii);
            i++;
            if (i > 4) {
                if (choices[0] == 0 & choices[1] == 0 & choices[2] == 0 | choices[3] == 0 & choices[4] == 0 & choices[5] == 0) {
                    win1 = true;
                    break;
                } else if (choices[6] == 0 & choices[7] == 0 & choices[8] == 0 | choices[2] == 0 & choices[5] == 0 & choices[8] == 0) {
                    win1 = true;
                    break;
                } else if (choices[3] == 1 & choices[4] == 1 & choices[5] == 1 | choices[6] == 1 & choices[7] == 1 & choices[8] == 1) {
                    win2 = true;
                    break;
                } else if (choices[0] == 0 & choices[3] == 0 & choices[6] == 0 | choices[1] == 0 & choices[4] == 0 & choices[7] == 0) {
                    win1 = true;
                    break;
                } else if (choices[0] == 1 & choices[1] == 1 & choices[2] == 1 | choices[0] == 1 & choices[3] == 1 & choices[6] == 1) {
                    win2 = true;
                    break;
                } else if (choices[1] == 1 & choices[4] == 1 & choices[7] == 1 | choices[2] == 1 & choices[5] == 1 & choices[8] == 1) {
                    win2 = true;
                    break;
                } else if (choices[0] == 0 & choices[4] == 0 & choices[8] == 0 | choices[2] == 0 & choices[4] == 0 & choices[6] == 0) {
                    win1 = true;
                    break;
                } else if (choices[0] == 1 & choices[4] == 1 & choices[8] == 1 | choices[2] == 1 & choices[4] == 1 & choices[6] == 1) {
                    win2 = true;
                    break;
                }
            }
            if (i == 9) {
                System.out.println("GAME IS DRAW!");
                break;
            }
            System.out.println(user2 + " Where to do you want to mark? ");
            int game2 = scanner.nextInt();
            if (choices[game2 - 1] == 0 | choices[game2 - 1] == 1) {
                System.out.println("That position is already marked. Choose another square.");
                invalid = true;
            }
            while(invalid) {
                game2 = scanner.nextInt();
                if (choices[game2 - 1] != 0 & choices[game2 - 1] != 1) {
                    invalid = false;
                }
            }
            choices[game2 - 1] = choice2;
            String str2 = Integer.toString(game2);
            ascii = ascii.replace(str2, characters[choice2]);
            System.out.println(ascii);
            i++;
            if (i > 4) {
                if (choices[0] == 0 & choices[1] == 0 & choices[2] == 0 | choices[3] == 0 & choices[4] == 0 & choices[5] == 0) {
                    win1 = true;
                    break;
                } else if (choices[6] == 0 & choices[7] == 0 & choices[8] == 0 | choices[2] == 0 & choices[5] == 0 & choices[8] == 0) {
                    win1 = true;
                    break;
                } else if (choices[3] == 1 & choices[4] == 1 & choices[5] == 1 | choices[6] == 1 & choices[7] == 1 & choices[8] == 1) {
                    win2 = true;
                    break;
                } else if (choices[0] == 0 & choices[3] == 0 & choices[6] == 0 | choices[1] == 0 & choices[4] == 0 & choices[7] == 0) {
                    win1 = true;
                    break;
                } else if (choices[0] == 1 & choices[1] == 1 & choices[2] == 1 | choices[0] == 1 & choices[3] == 1 & choices[6] == 1) {
                    win2 = true;
                    break;
                } else if (choices[1] == 1 & choices[4] == 1 & choices[7] == 1 | choices[2] == 1 & choices[5] == 1 & choices[8] == 1) {
                    win2 = true;
                    break;
                } else if (choices[0] == 0 & choices[4] == 0 & choices[8] == 0 | choices[2] == 0 & choices[4] == 0 & choices[6] == 0) {
                    win1 = true;
                    break;
                } else if (choices[0] == 1 & choices[4] == 1 & choices[8] == 1 | choices[2] == 1 & choices[4] == 1 & choices[6] == 1) {
                    win2 = true;
                    break;
                }
            }
        }
        if (win1) {
            System.out.println(user1 + " Won, Congratulations!");
        } else if (win2) {
            System.out.println(user2 + " Won,Congratulations!");
        }
    }

}