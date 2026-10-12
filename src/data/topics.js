import {
  Brackets,
  Type,
  Link,
  Layers,
  Hash,
  ArrowUpDown,
  Network,
  Waypoints,
  Grid3x3,
} from "lucide-react";

// Temporary demo data.
// Later, this data will come from your backend API.
export const topics = [
  {
    id: "arrays",
    title: "Arrays",
    category: "Data Structures",
    description: "Store, access and traverse elements kept side by side in memory.",
    level: "Beginner",
    lessons: 12,
    progress: 65,
    readTime: "10–15 min read",
    icon: Brackets,
    color: "purple",
    theory:
      "An array stores elements in one contiguous block of memory. Because every element takes the same amount of space, the position of any element can be calculated directly from its index, which makes reading arr[i] a constant-time operation. The trade-off is that inserting or deleting in the middle means shifting every element after it.",
    tip: "Many array problems can be solved in a single pass with two pointers, a sliding window or a running prefix sum. Look for those patterns before reaching for nested loops.",
    steps: [
      "Memory is reserved for all the elements in one continuous block.",
      "Each element is identified by its index, starting at 0.",
      "The address of arr[i] is base address + i × element size.",
      "So reading or updating any index takes the same time.",
      "Inserting or deleting in the middle shifts every later element.",
    ],
    complexity: [
      { label: "Access by index", value: "O(1)", note: "Address is calculated directly" },
      { label: "Search", value: "O(n)", note: "Unsorted data needs a linear scan" },
      { label: "Insert / delete", value: "O(n)", note: "Later elements must shift" },
      { label: "Space", value: "O(n)", note: "One slot per element" },
    ],
    pseudocode: `function linearSearch(array, target)
    for i = 0 to length(array) - 1
        if array[i] == target
            return i

    return -1`,
    resources: [
      {
        title: "Array (data structure)",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Array_(data_structure)",
      },
      {
        title: "Arrays explained",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=array+data+structure+explained",
      },
    ],
    problems: [
      {
        title: "Two Sum",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/two-sum/",
      },
      {
        title: "Best Time to Buy and Sell Stock",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      },
      {
        title: "Maximum Subarray",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/maximum-subarray/",
      },
    ],
  },
  {
    id: "strings",
    title: "Strings",
    category: "Data Structures",
    description: "Pattern matching, two pointers and everyday text manipulation.",
    level: "Beginner",
    lessons: 10,
    progress: 30,
    readTime: "10–15 min read",
    icon: Type,
    color: "blue",
    theory:
      "A string is a sequence of characters, usually stored much like an array of characters. In many languages, including JavaScript, Java and Python, strings are immutable: every change creates a new string, so building one character at a time in a loop can be slow. String problems often come down to comparing characters, counting them, or scanning with two pointers.",
    tip: "When a problem asks about anagrams or character counts, a frequency map (or a 26-slot array for lowercase letters) usually turns an O(n²) idea into O(n).",
    steps: [
      "Place one pointer at the start of the string and one at the end.",
      "Compare the characters under both pointers.",
      "If they differ, the string is not a palindrome.",
      "If they match, move both pointers toward the middle.",
      "When the pointers meet, every pair has matched.",
    ],
    complexity: [
      { label: "Access a character", value: "O(1)", note: "Indexed like an array" },
      { label: "Find a substring", value: "O(n·m)", note: "Naive matching of a length-m pattern" },
      { label: "Concatenate", value: "O(n + m)", note: "A new string is created" },
      { label: "Space", value: "O(n)", note: "One slot per character" },
    ],
    pseudocode: `function isPalindrome(text)
    left = 0
    right = length(text) - 1

    while left < right
        if text[left] != text[right]
            return false
        left = left + 1
        right = right - 1

    return true`,
    resources: [
      {
        title: "String (computer science)",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/String_(computer_science)",
      },
      {
        title: "String problems with two pointers",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=string+two+pointers+technique",
      },
    ],
    problems: [
      {
        title: "Valid Palindrome",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/valid-palindrome/",
      },
      {
        title: "Valid Anagram",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/valid-anagram/",
      },
      {
        title: "Longest Substring Without Repeating Characters",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      },
    ],
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    category: "Data Structures",
    description: "Chain nodes with pointers and master insertion and reversal.",
    level: "Beginner",
    lessons: 8,
    progress: 15,
    readTime: "15–20 min read",
    icon: Link,
    color: "green",
    theory:
      "A linked list stores each element in a separate node that holds a value and a pointer to the next node. Nodes can live anywhere in memory, so inserting or removing a node only means updating a couple of pointers, with no shifting required. The cost is that there is no index: reaching the k-th node means walking from the head one step at a time.",
    tip: "Draw the pointers on paper before you code. Most linked-list bugs come from overwriting next before saving the node you still need.",
    steps: [
      "Keep three pointers: previous (null), current (head) and next.",
      "Save current.next so the rest of the list is not lost.",
      "Point current.next back to previous.",
      "Move previous and current one step forward.",
      "When current is null, previous is the new head.",
    ],
    complexity: [
      { label: "Access", value: "O(n)", note: "Walk from the head" },
      { label: "Search", value: "O(n)", note: "Linear scan of the nodes" },
      { label: "Insert / delete", value: "O(1)", note: "Given a pointer to the position" },
      { label: "Space", value: "O(n)", note: "One node per element" },
    ],
    pseudocode: `function reverseList(head)
    previous = null
    current = head

    while current != null
        next = current.next
        current.next = previous
        previous = current
        current = next

    return previous`,
    resources: [
      {
        title: "Linked list",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Linked_list",
      },
      {
        title: "Linked lists explained",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=linked+list+data+structure+explained",
      },
    ],
    problems: [
      {
        title: "Reverse Linked List",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/reverse-linked-list/",
      },
      {
        title: "Merge Two Sorted Lists",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/merge-two-sorted-lists/",
      },
      {
        title: "Linked List Cycle",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/linked-list-cycle/",
      },
    ],
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    category: "Data Structures",
    description: "The LIFO and FIFO structures behind undo, parsing and scheduling.",
    level: "Intermediate",
    lessons: 9,
    progress: 0,
    readTime: "15–20 min read",
    icon: Layers,
    color: "orange",
    theory:
      "A stack is Last-In-First-Out: you push items on top and pop them from the top, like a pile of plates. A queue is First-In-First-Out: items join at the back and leave from the front, like a line at a counter. Both restrict where you can add and remove items, and that restriction is exactly what makes them fast and easy to reason about.",
    tip: "When a problem involves matching pairs or undoing the most recent action, think stack. When the order of arrival matters, think queue.",
    steps: [
      "Read the expression one character at a time.",
      "Push every opening bracket onto the stack.",
      "On a closing bracket, pop the top of the stack.",
      "If the stack was empty or the brackets do not match, it is unbalanced.",
      "At the end, the expression is balanced only if the stack is empty.",
    ],
    complexity: [
      { label: "Push / enqueue", value: "O(1)", note: "Add at one end" },
      { label: "Pop / dequeue", value: "O(1)", note: "Remove from one end" },
      { label: "Peek", value: "O(1)", note: "Read without removing" },
      { label: "Space", value: "O(n)", note: "One slot per item" },
    ],
    pseudocode: `function isBalanced(expression)
    stack = empty stack

    for each char in expression
        if char is an opening bracket
            push char onto stack
        else if char is a closing bracket
            if stack is empty or pop(stack) does not match char
                return false

    return stack is empty`,
    resources: [
      {
        title: "Stack (abstract data type)",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Stack_(abstract_data_type)",
      },
      {
        title: "Queue (abstract data type)",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Queue_(abstract_data_type)",
      },
      {
        title: "Stacks and queues explained",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=stacks+and+queues+explained",
      },
    ],
    problems: [
      {
        title: "Valid Parentheses",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/valid-parentheses/",
      },
      {
        title: "Implement Queue using Stacks",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/implement-queue-using-stacks/",
      },
      {
        title: "Min Stack",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/min-stack/",
      },
    ],
  },
  {
    id: "hashing",
    title: "Hashing",
    category: "Data Structures",
    description: "Constant-time lookups with hash maps and hash sets.",
    level: "Intermediate",
    lessons: 7,
    progress: 0,
    readTime: "15–20 min read",
    icon: Hash,
    color: "pink",
    theory:
      "A hash table stores key–value pairs in an array of buckets. A hash function turns each key into a bucket index, so finding a key means computing its hash and looking in one place instead of scanning everything. When two keys land in the same bucket (a collision), the table still has to keep both, for example by storing a small list in each bucket.",
    tip: "If a brute-force solution checks every pair, ask whether storing what you have already seen in a hash map lets you answer each step in O(1).",
    steps: [
      "Pass the key through a hash function to get a number.",
      "Take that number modulo the table size to pick a bucket.",
      "To insert, add the key–value pair to that bucket.",
      "To look up, hash the key again and search only that bucket.",
      "When the table gets too full, resize it and rehash every key.",
    ],
    complexity: [
      { label: "Insert", value: "O(1)", note: "Average case" },
      { label: "Lookup", value: "O(1)", note: "Average case" },
      { label: "Worst case", value: "O(n)", note: "Every key collides in one bucket" },
      { label: "Space", value: "O(n)", note: "One entry per key" },
    ],
    pseudocode: `function put(table, key, value)
    index = hash(key) mod size(table)
    bucket = table[index]

    for each entry in bucket
        if entry.key == key
            entry.value = value
            return

    append (key, value) to bucket`,
    resources: [
      {
        title: "Hash table",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Hash_table",
      },
      {
        title: "Hash tables explained",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=hash+table+explained",
      },
    ],
    problems: [
      {
        title: "Contains Duplicate",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/contains-duplicate/",
      },
      {
        title: "Group Anagrams",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/group-anagrams/",
      },
      {
        title: "Longest Consecutive Sequence",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/longest-consecutive-sequence/",
      },
    ],
  },
  {
    id: "bubble-sort",
    title: "Bubble Sort",
    category: "Sorting Algorithms",
    description:
      "Learn how adjacent elements are compared and swapped until the array is sorted.",
    level: "Beginner",
    lessons: 6,
    progress: 0,
    readTime: "10–15 min read",
    icon: ArrowUpDown,
    color: "green",
    theory:
      "Bubble Sort repeatedly compares adjacent elements and swaps them if they are in the wrong order. After each pass, the largest unsorted element reaches its correct position at the end of the array.",
    tip: "After each complete pass, the largest remaining element reaches the end of the unsorted section.",
    steps: [
      "Start with the first two elements.",
      "Compare the adjacent elements.",
      "Swap them if the left element is greater than the right.",
      "Continue until the end of the unsorted portion.",
      "Repeat until no swaps are required.",
    ],
    complexity: [
      { label: "Best case", value: "O(n)", note: "Already sorted, with an early-exit check" },
      { label: "Average case", value: "O(n²)", note: "Repeated comparisons and swaps" },
      { label: "Worst case", value: "O(n²)", note: "Reverse-sorted input" },
      { label: "Space", value: "O(1)", note: "In-place sorting" },
    ],
    pseudocode: `for i = 0 to n - 2
    swapped = false

    for j = 0 to n - i - 2
        if array[j] > array[j + 1]
            swap(array[j], array[j + 1])
            swapped = true

    if swapped == false
        break`,
    resources: [
      {
        title: "Bubble Sort Algorithm",
        source: "GeeksforGeeks",
        url: "https://www.geeksforgeeks.org/bubble-sort-algorithm/",
      },
      {
        title: "Sorting algorithms explained",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=bubble+sort+algorithm+explained",
      },
    ],
    problems: [
      {
        title: "Sort an Array",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/sort-an-array/",
      },
    ],
  },
  {
    id: "trees",
    title: "Trees",
    category: "Data Structures",
    description: "Binary trees, BSTs and the traversals that power them.",
    level: "Intermediate",
    lessons: 14,
    progress: 0,
    readTime: "20–25 min read",
    icon: Network,
    color: "purple",
    theory:
      "A tree is a hierarchy of nodes: one root at the top, and every other node has exactly one parent. In a binary tree each node has at most two children, left and right. A binary search tree adds an ordering rule (smaller values to the left, larger to the right), so when the tree is balanced each comparison lets you skip half of what remains.",
    tip: "Most tree problems are recursive: solve the problem for the left and right subtrees, then combine the two answers at the current node.",
    steps: [
      "Start at the root node.",
      "Recursively visit the entire left subtree.",
      "Visit the current node and record its value.",
      "Recursively visit the entire right subtree.",
      "In a binary search tree, this visits the values in sorted order.",
    ],
    complexity: [
      { label: "Search (balanced BST)", value: "O(log n)", note: "Half the tree is skipped each step" },
      { label: "Insert / delete", value: "O(log n)", note: "In a balanced BST" },
      { label: "Worst case", value: "O(n)", note: "A skewed tree behaves like a list" },
      { label: "Traversal", value: "O(n)", note: "Every node is visited once" },
    ],
    pseudocode: `function inorder(node)
    if node == null
        return

    inorder(node.left)
    visit(node)
    inorder(node.right)`,
    resources: [
      {
        title: "Binary tree",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Binary_tree",
      },
      {
        title: "Binary search tree",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Binary_search_tree",
      },
      {
        title: "Tree traversals explained",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=binary+tree+traversal+explained",
      },
    ],
    problems: [
      {
        title: "Maximum Depth of Binary Tree",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
      },
      {
        title: "Invert Binary Tree",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/invert-binary-tree/",
      },
      {
        title: "Binary Tree Level Order Traversal",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
      },
    ],
  },
  {
    id: "graphs",
    title: "Graphs",
    category: "Graph Algorithms",
    description: "Model connections and explore them with BFS and DFS.",
    level: "Advanced",
    lessons: 12,
    progress: 0,
    readTime: "25–30 min read",
    icon: Waypoints,
    color: "blue",
    theory:
      "A graph is a set of vertices connected by edges. Edges can be directed or undirected, weighted or unweighted, and graphs are usually stored as an adjacency list that maps each vertex to its neighbours. Breadth-first search (BFS) explores level by level using a queue, while depth-first search (DFS) follows one path as deep as possible before backtracking.",
    tip: "Always track visited vertices. Unlike trees, graphs can contain cycles, and forgetting the visited set leads to infinite loops.",
    steps: [
      "Add the starting vertex to a queue and mark it visited.",
      "Remove the vertex at the front of the queue.",
      "Look at each of its neighbours.",
      "Add every unvisited neighbour to the queue and mark it visited.",
      "Repeat until the queue is empty.",
    ],
    complexity: [
      { label: "BFS / DFS", value: "O(V + E)", note: "Every vertex and edge once" },
      { label: "Adjacency list", value: "O(V + E)", note: "Space for existing edges only" },
      { label: "Adjacency matrix", value: "O(V²)", note: "Space for every vertex pair" },
      { label: "Edge check (matrix)", value: "O(1)", note: "Direct cell lookup" },
    ],
    pseudocode: `function bfs(graph, start)
    queue = [start]
    visited = { start }

    while queue is not empty
        vertex = dequeue(queue)
        visit(vertex)

        for each neighbour of vertex in graph
            if neighbour is not in visited
                add neighbour to visited
                enqueue(queue, neighbour)`,
    resources: [
      {
        title: "Graph (abstract data type)",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Graph_(abstract_data_type)",
      },
      {
        title: "Breadth-first search",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Breadth-first_search",
      },
      {
        title: "BFS and DFS explained",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=bfs+and+dfs+graph+explained",
      },
    ],
    problems: [
      {
        title: "Number of Islands",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/number-of-islands/",
      },
      {
        title: "Clone Graph",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/clone-graph/",
      },
      {
        title: "Course Schedule",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/course-schedule/",
      },
    ],
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    category: "Algorithm Techniques",
    description: "Break problems into overlapping subproblems and reuse the answers.",
    level: "Advanced",
    lessons: 15,
    progress: 0,
    readTime: "25–30 min read",
    icon: Grid3x3,
    color: "orange",
    theory:
      "Dynamic programming solves a problem by breaking it into smaller subproblems, solving each one once, and storing the answer so it is never recomputed. It works when subproblems overlap and the best answer can be built from the best answers to smaller pieces. You can work top-down with recursion and memoisation, or bottom-up by filling a table from the smallest case.",
    tip: "Start by naming the state: what exactly does dp[i] mean? Once that sentence is clear, the recurrence and the table usually follow.",
    steps: [
      "Define the state: ways[i] is the number of ways to reach step i.",
      "Find the recurrence: ways[i] = ways[i - 1] + ways[i - 2].",
      "Set the base cases: ways[0] = 1 and ways[1] = 1.",
      "Fill the table from the smallest step upward.",
      "Return ways[n] as the final answer.",
    ],
    complexity: [
      { label: "Naive recursion", value: "O(2ⁿ)", note: "Same subproblems solved repeatedly" },
      { label: "With memoisation", value: "O(n)", note: "Each step is solved once" },
      { label: "Bottom-up table", value: "O(n)", note: "One pass over the states" },
      { label: "Optimised space", value: "O(1)", note: "Keep only the last two answers" },
    ],
    pseudocode: `function climbStairs(n)
    ways = array of size n + 1
    ways[0] = 1
    ways[1] = 1

    for i = 2 to n
        ways[i] = ways[i - 1] + ways[i - 2]

    return ways[n]`,
    resources: [
      {
        title: "Dynamic programming",
        source: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Dynamic_programming",
      },
      {
        title: "Dynamic programming explained",
        source: "YouTube search",
        url: "https://www.youtube.com/results?search_query=dynamic+programming+explained",
      },
    ],
    problems: [
      {
        title: "Climbing Stairs",
        platform: "LeetCode",
        difficulty: "Easy",
        url: "https://leetcode.com/problems/climbing-stairs/",
      },
      {
        title: "House Robber",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/house-robber/",
      },
      {
        title: "Coin Change",
        platform: "LeetCode",
        difficulty: "Medium",
        url: "https://leetcode.com/problems/coin-change/",
      },
    ],
  },
];
