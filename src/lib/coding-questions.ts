export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  topic: string;
  languages: string[];
  description: string;
  examples: string;
  constraints: string;
  testCases: TestCase[];
  starterCode: Record<string, string>;
}

export const STARTER_TEMPLATES: Record<string, string> = {
  python: '# Write your solution here\n\n',
  javascript: '// Write your solution here\n\n',
  java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
  c: '#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n',
};

export const codingQuestions: CodingQuestion[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    topic: 'Arrays',
    languages: ['python', 'javascript', 'java', 'cpp', 'c'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] == 9',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0, 1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1, 2]' },
    ],
    starterCode: {
      python: 'def twoSum(nums, target):\n    # Write your solution here\n    pass\n\nnums = list(map(int, input().split(",")))\ntarget = int(input())\nprint(twoSum(nums, target))',
      javascript: 'function twoSum(nums, target) {\n  // Write your solution here\n}\n\nconsole.log(twoSum([2,7,11,15], 9));',
      java: 'import java.util.*;\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15}, 9)));\n    }\n}',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2,7,11,15};\n    auto r = twoSum(nums, 9);\n    cout << "[" << r[0] << ", " << r[1] << "]";\n    return 0;\n}',
      c: '#include <stdio.h>\n\nvoid twoSum(int* nums, int size, int target, int* result) {\n    // Write your solution here\n}\n\nint main() {\n    int nums[] = {2,7,11,15};\n    int result[2];\n    twoSum(nums, 4, 9, result);\n    printf("[%d, %d]", result[0], result[1]);\n    return 0;\n}',
    },
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    topic: 'Strings',
    languages: ['python', 'javascript', 'java', 'cpp', 'c'],
    description: 'Write a function that reverses a string. The input string is given as an array of characters.',
    examples: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
    constraints: '1 <= s.length <= 10^5\ns[i] is a printable ASCII character.',
    testCases: [
      { input: 'hello', expectedOutput: 'olleh' },
      { input: 'world', expectedOutput: 'dlrow' },
    ],
    starterCode: {
      python: 'def reverseString(s):\n    # Write your solution here\n    pass\n\nprint(reverseString(input()))',
      javascript: 'function reverseString(s) {\n  // Write your solution here\n}\nconsole.log(reverseString("hello"));',
      java: 'public class Solution {\n    public static String reverseString(String s) {\n        // Write your solution here\n        return "";\n    }\n    public static void main(String[] args) {\n        System.out.println(reverseString("hello"));\n    }\n}',
      cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nstring reverseString(string s) {\n    // Write your solution here\n    return "";\n}\n\nint main() {\n    cout << reverseString("hello");\n    return 0;\n}',
      c: '#include <stdio.h>\n#include <string.h>\n\nvoid reverseString(char* s) {\n    // Write your solution here\n}\n\nint main() {\n    char s[] = "hello";\n    reverseString(s);\n    printf("%s", s);\n    return 0;\n}',
    },
  },
  {
    id: 'palindrome-check',
    title: 'Palindrome Check',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    topic: 'Strings',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    examples: 'Input: "A man, a plan, a canal: Panama"\nOutput: true',
    constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
    testCases: [
      { input: 'racecar', expectedOutput: 'true' },
      { input: 'hello', expectedOutput: 'false' },
    ],
    starterCode: {
      python: 'def isPalindrome(s):\n    # Write your solution here\n    pass\n\nprint(isPalindrome(input()))',
      javascript: 'function isPalindrome(s) {\n  // Write your solution here\n}\nconsole.log(isPalindrome("racecar"));',
      java: 'public class Solution {\n    public static boolean isPalindrome(String s) {\n        // Write your solution here\n        return false;\n    }\n    public static void main(String[] args) {\n        System.out.println(isPalindrome("racecar"));\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nbool isPalindrome(string s) {\n    // Write your solution here\n    return false;\n}\n\nint main() {\n    cout << (isPalindrome("racecar") ? "true" : "false");\n    return 0;\n}',
    },
  },
  {
    id: 'fizz-buzz',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    tags: ['Math', 'Simulation'],
    topic: 'Basics',
    languages: ['python', 'javascript', 'java', 'cpp', 'c'],
    description: 'Given an integer n, return a string array where: answer[i] == "FizzBuzz" if i is divisible by 3 and 5, "Fizz" if divisible by 3, "Buzz" if divisible by 5, or i (as string) otherwise.',
    examples: 'Input: n = 5\nOutput: ["1","2","Fizz","4","Buzz"]',
    constraints: '1 <= n <= 10^4',
    testCases: [
      { input: '3', expectedOutput: '1\n2\nFizz' },
      { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz' },
    ],
    starterCode: {
      python: 'def fizzBuzz(n):\n    # Write your solution here\n    pass\n\nn = int(input())\nfor x in fizzBuzz(n):\n    print(x)',
      javascript: 'function fizzBuzz(n) {\n  // Write your solution here\n  return [];\n}\nfizzBuzz(5).forEach(x => console.log(x));',
      java: 'import java.util.*;\npublic class Solution {\n    public static List<String> fizzBuzz(int n) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n    public static void main(String[] args) {\n        fizzBuzz(5).forEach(System.out::println);\n    }\n}',
      cpp: '#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nvector<string> fizzBuzz(int n) {\n    // Write your solution here\n    return {};\n}\n\nint main() {\n    for (auto& s : fizzBuzz(5)) cout << s << "\\n";\n    return 0;\n}',
      c: '#include <stdio.h>\n\nvoid fizzBuzz(int n) {\n    // Write your solution here\n}\n\nint main() {\n    fizzBuzz(5);\n    return 0;\n}',
    },
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    topic: 'Searching',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'Given a sorted array of integers and a target value, return the index if the target is found. If not, return -1.',
    examples: 'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4',
    constraints: '1 <= nums.length <= 10^4\nnums is sorted in ascending order.',
    testCases: [
      { input: '-1,0,3,5,9,12\n9', expectedOutput: '4' },
      { input: '-1,0,3,5,9,12\n2', expectedOutput: '-1' },
    ],
    starterCode: {
      python: 'def binarySearch(nums, target):\n    # Write your solution here\n    pass\n\nnums = list(map(int, input().split(",")))\ntarget = int(input())\nprint(binarySearch(nums, target))',
      javascript: 'function binarySearch(nums, target) {\n  // Write your solution here\n  return -1;\n}\nconsole.log(binarySearch([-1,0,3,5,9,12], 9));',
      java: 'public class Solution {\n    public static int binarySearch(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n    public static void main(String[] args) {\n        System.out.println(binarySearch(new int[]{-1,0,3,5,9,12}, 9));\n    }\n}',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint binarySearch(vector<int>& nums, int target) {\n    // Write your solution here\n    return -1;\n}\n\nint main() {\n    vector<int> nums = {-1,0,3,5,9,12};\n    cout << binarySearch(nums, 9);\n    return 0;\n}',
    },
  },
  {
    id: 'merge-sorted-arrays',
    title: 'Merge Two Sorted Arrays',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    topic: 'Arrays',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums2 into nums1 as one sorted array and return it.',
    examples: 'Input: nums1 = [1,3,5], nums2 = [2,4,6]\nOutput: [1,2,3,4,5,6]',
    constraints: 'nums1.length == m\nnums2.length == n\n0 <= m, n <= 200',
    testCases: [
      { input: '1,3,5\n2,4,6', expectedOutput: '[1, 2, 3, 4, 5, 6]' },
    ],
    starterCode: {
      python: 'def mergeSorted(nums1, nums2):\n    # Write your solution here\n    pass\n\nn1 = list(map(int, input().split(",")))\nn2 = list(map(int, input().split(",")))\nprint(mergeSorted(n1, n2))',
      javascript: 'function mergeSorted(nums1, nums2) {\n  // Write your solution here\n  return [];\n}\nconsole.log(mergeSorted([1,3,5], [2,4,6]));',
      java: 'import java.util.*;\npublic class Solution {\n    public static int[] mergeSorted(int[] a, int[] b) {\n        // Write your solution here\n        return new int[]{};\n    }\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(mergeSorted(new int[]{1,3,5}, new int[]{2,4,6})));\n    }\n}',
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> mergeSorted(vector<int>& a, vector<int>& b) {\n    // Write your solution here\n    return {};\n}\n\nint main() {\n    vector<int> a={1,3,5}, b={2,4,6};\n    auto r = mergeSorted(a,b);\n    for(int x:r) cout<<x<<" ";\n    return 0;\n}',
    },
  },
  {
    id: 'linked-list-cycle',
    title: 'Detect Cycle in Linked List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers'],
    topic: 'Linked Lists',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'Given head of a linked list, determine if the linked list has a cycle in it using Floyd\'s cycle detection algorithm.',
    examples: 'Input: head = [3,2,0,-4], pos = 1\nOutput: true\nExplanation: There is a cycle where tail connects to node index 1.',
    constraints: 'The number of nodes is in range [0, 10^4]\n-10^5 <= Node.val <= 10^5',
    testCases: [
      { input: '3,2,0,-4\n1', expectedOutput: 'true' },
    ],
    starterCode: {
      python: 'class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef hasCycle(head):\n    # Use Floyd\'s Tortoise and Hare\n    pass\n\nprint("Implement and test locally")',
      javascript: 'class ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}\n\nfunction hasCycle(head) {\n  // Use Floyd\'s Tortoise and Hare\n  return false;\n}\nconsole.log("Implement and test locally");',
      java: 'public class Solution {\n    static class ListNode {\n        int val;\n        ListNode next;\n        ListNode(int x) { val = x; }\n    }\n    public static boolean hasCycle(ListNode head) {\n        // Write your solution here\n        return false;\n    }\n    public static void main(String[] args) {\n        System.out.println("Implement and test locally");\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nstruct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nbool hasCycle(ListNode* head) {\n    // Write your solution here\n    return false;\n}\n\nint main() {\n    cout << "Implement and test locally";\n    return 0;\n}',
    },
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane\'s)',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    topic: 'Dynamic Programming',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: 'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.',
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    testCases: [
      { input: '-2,1,-3,4,-1,2,1,-5,4', expectedOutput: '6' },
      { input: '1', expectedOutput: '1' },
    ],
    starterCode: {
      python: 'def maxSubArray(nums):\n    # Use Kadane\'s Algorithm\n    pass\n\nnums = list(map(int, input().split(",")))\nprint(maxSubArray(nums))',
      javascript: 'function maxSubArray(nums) {\n  // Use Kadane\'s Algorithm\n  return 0;\n}\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));',
      java: 'public class Solution {\n    public static int maxSubArray(int[] nums) {\n        // Use Kadane\'s Algorithm\n        return 0;\n    }\n    public static void main(String[] args) {\n        System.out.println(maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4}));\n    }\n}',
      cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Use Kadane\'s Algorithm\n    return 0;\n}\n\nint main() {\n    vector<int> nums = {-2,1,-3,4,-1,2,1,-5,4};\n    cout << maxSubArray(nums);\n    return 0;\n}',
    },
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['Stack', 'String'],
    topic: 'Stacks',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    examples: 'Input: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only.',
    testCases: [
      { input: '()[]{}', expectedOutput: 'true' },
      { input: '(]', expectedOutput: 'false' },
    ],
    starterCode: {
      python: 'def isValid(s):\n    # Write your solution here\n    pass\n\nprint(isValid(input()))',
      javascript: 'function isValid(s) {\n  // Write your solution here\n  return false;\n}\nconsole.log(isValid("()[]{}"));',
      java: 'import java.util.*;\npublic class Solution {\n    public static boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n    public static void main(String[] args) {\n        System.out.println(isValid("()[]{}"));\n    }\n}',
      cpp: '#include <iostream>\n#include <stack>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your solution here\n    return false;\n}\n\nint main() {\n    cout << (isValid("()[]{}") ? "true" : "false");\n    return 0;\n}',
    },
  },
  {
    id: 'longest-common-subseq',
    title: 'Longest Common Subsequence',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'String'],
    topic: 'Dynamic Programming',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.',
    examples: 'Input: text1 = "abcde", text2 = "ace"\nOutput: 3\nExplanation: The longest common subsequence is "ace".',
    constraints: '1 <= text1.length, text2.length <= 1000\ntext1 and text2 consist of only lowercase English characters.',
    testCases: [
      { input: 'abcde\nace', expectedOutput: '3' },
      { input: 'abc\ndef', expectedOutput: '0' },
    ],
    starterCode: {
      python: 'def longestCommonSubsequence(text1, text2):\n    # Write your solution here\n    pass\n\nt1 = input()\nt2 = input()\nprint(longestCommonSubsequence(t1, t2))',
      javascript: 'function longestCommonSubsequence(text1, text2) {\n  // Write your solution here\n  return 0;\n}\nconsole.log(longestCommonSubsequence("abcde", "ace"));',
      java: 'public class Solution {\n    public static int longestCommonSubsequence(String t1, String t2) {\n        // Write your solution here\n        return 0;\n    }\n    public static void main(String[] args) {\n        System.out.println(longestCommonSubsequence("abcde", "ace"));\n    }\n}',
      cpp: '#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint longestCommonSubsequence(string t1, string t2) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    cout << longestCommonSubsequence("abcde", "ace");\n    return 0;\n}',
    },
  },
  {
    id: 'n-queens',
    title: 'N-Queens',
    difficulty: 'Hard',
    tags: ['Backtracking', 'Recursion'],
    topic: 'Backtracking',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Return the number of distinct solutions.',
    examples: 'Input: n = 4\nOutput: 2',
    constraints: '1 <= n <= 9',
    testCases: [
      { input: '4', expectedOutput: '2' },
      { input: '1', expectedOutput: '1' },
    ],
    starterCode: {
      python: 'def totalNQueens(n):\n    # Write your solution here\n    pass\n\nprint(totalNQueens(int(input())))',
      javascript: 'function totalNQueens(n) {\n  // Write your solution here\n  return 0;\n}\nconsole.log(totalNQueens(4));',
      java: 'public class Solution {\n    public static int totalNQueens(int n) {\n        // Write your solution here\n        return 0;\n    }\n    public static void main(String[] args) {\n        System.out.println(totalNQueens(4));\n    }\n}',
      cpp: '#include <iostream>\nusing namespace std;\n\nint totalNQueens(int n) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    cout << totalNQueens(4);\n    return 0;\n}',
    },
  },
  {
    id: 'graph-bfs',
    title: 'BFS Level Order Traversal',
    difficulty: 'Medium',
    tags: ['Tree', 'BFS', 'Queue'],
    topic: 'Trees & Graphs',
    languages: ['python', 'javascript', 'java', 'cpp'],
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
    examples: 'Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]',
    constraints: 'The number of nodes is in range [0, 2000]\n-1000 <= Node.val <= 1000',
    testCases: [
      { input: '3,9,20,null,null,15,7', expectedOutput: '[[3], [9, 20], [15, 7]]' },
    ],
    starterCode: {
      python: 'from collections import deque\n\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef levelOrder(root):\n    # Write your BFS solution here\n    pass\n\nprint("Implement and test locally")',
      javascript: 'class TreeNode {\n  constructor(val, left = null, right = null) {\n    this.val = val;\n    this.left = left;\n    this.right = right;\n  }\n}\n\nfunction levelOrder(root) {\n  // Write your BFS solution here\n  return [];\n}\nconsole.log("Implement and test locally");',
      java: 'import java.util.*;\npublic class Solution {\n    static class TreeNode {\n        int val; TreeNode left, right;\n        TreeNode(int v) { val = v; }\n    }\n    public static List<List<Integer>> levelOrder(TreeNode root) {\n        // Write your BFS solution here\n        return new ArrayList<>();\n    }\n    public static void main(String[] args) {\n        System.out.println("Implement and test locally");\n    }\n}',
      cpp: '#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nvector<vector<int>> levelOrder(TreeNode* root) {\n    // Write your BFS solution here\n    return {};\n}\n\nint main() {\n    cout << "Implement and test locally";\n    return 0;\n}',
    },
  },
];

export function getQuestionsByDifficulty(d: string) {
  return codingQuestions.filter(q => q.difficulty === d);
}

export function getQuestionsByTopic(t: string) {
  return codingQuestions.filter(q => q.topic === t);
}

export function getUniqueTopics() {
  return [...new Set(codingQuestions.map(q => q.topic))];
}
