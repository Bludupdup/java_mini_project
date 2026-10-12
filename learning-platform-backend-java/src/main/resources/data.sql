-- ========================================================
-- Seed Data for Spring Boot DSA Learning Platform
-- ========================================================

-- 1. Insert Stages
INSERT INTO stages (id, name, description, sequence_number) VALUES
(1, 'Stage 1: Algorithmic Foundations & Sorting', 'Master core sorting, divide-and-conquer principles, and two-pointer search strategies.', 1),
(2, 'Stage 2: Core Linear Data Structures', 'Master memory representations, stacks, queues, hash tables, and sliding window paradigms.', 2),
(3, 'Stage 3: Trees & Hierarchical Structures', 'Understand recursive tree structures, binary search trees, priority heaps, and prefix tries.', 3),
(4, 'Stage 4: Graph Algorithms & Traversals', 'Explore graph representations, BFS/DFS, shortest path algorithms, MSTs, and topological sorting.', 4),
(5, 'Stage 5: Dynamic Programming & Advanced Paradigms', 'Tackle state-transition modeling, memoization, tabular DP, greedy choices, and backtracking.', 5)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert 24 Topics
INSERT INTO topics (id, stage_id, title, description, sequence_number, slug) VALUES
(1, 1, 'Bubble Sort & Selection Sort', 'Fundamental quadratic sorting algorithms comparing adjacent elements and finding minimum keys.', 1, 'bubble-selection-sort'),
(2, 1, 'Insertion Sort', 'Adaptive sorting algorithm that constructs the final sorted array one item at a time.', 2, 'insertion-sort'),
(3, 1, 'Merge Sort', 'Classic divide-and-conquer algorithm with guaranteed O(N log N) time and stable element preservation.', 3, 'merge-sort'),
(4, 1, 'Quick Sort', 'Partition-based divide-and-conquer algorithm with optimal in-place average O(N log N) runtime.', 4, 'quick-sort'),
(5, 1, 'Binary Search & Two Pointers', 'Logarithmic search mechanism over monotonic spaces coupled with bidirectional converging pointers.', 5, 'binary-search-two-pointers'),
(6, 2, 'Singly & Doubly Linked Lists', 'Dynamic linear pointer-linked nodes enabling O(1) insertions and deletions at boundaries.', 6, 'linked-lists'),
(7, 2, 'Stack & Monotonic Stack', 'Last-In-First-Out data structure and monotonic invariants for next-greater/smaller element problems.', 7, 'stack-monotonic-stack'),
(8, 2, 'Queue & Deque', 'First-In-First-Out structures, circular ring buffers, and double-ended queues for window operations.', 8, 'queue-deque'),
(9, 2, 'Sliding Window Technique', 'Subarray and substring optimization technique converting nested loops into linear O(N) passes.', 9, 'sliding-window'),
(10, 2, 'Hash Tables & Collision Resolution', 'Constant amortized time associative lookups using bucket hashing, chaining, and open addressing.', 10, 'hash-tables'),
(11, 3, 'Binary Trees & Traversals', 'Hierarchical node branching with Preorder, Inorder, Postorder, and Level-Order traversals.', 11, 'binary-trees-traversals'),
(12, 3, 'Binary Search Trees (BST)', 'Ordered binary trees ensuring left-child < root < right-child for logarithmic search and insertion.', 12, 'binary-search-trees'),
(13, 3, 'Binary Heaps & Priority Queues', 'Complete binary tree structure satisfying the heap-order property for O(1) peek and O(log N) extract.', 13, 'heaps-priority-queues'),
(14, 3, 'Trie (Prefix Tree)', 'Specialized n-ary tree for lightning-fast retrieval of keys in prefix-based string datasets.', 14, 'trie-prefix-tree'),
(15, 4, 'Breadth-First Search (BFS) & Depth-First Search (DFS)', 'Core graph exploration algorithms exploring frontier levels vs depth-first backtracking branches.', 15, 'bfs-dfs-graphs'),
(16, 4, 'Dijkstra Algorithm', 'Greedy shortest path algorithm computing single-source shortest paths in non-negative weighted graphs.', 16, 'dijkstra-algorithm'),
(17, 4, 'Bellman-Ford & Floyd-Warshall', 'Dynamic programming-based pathfinding handling negative weights and all-pairs shortest paths.', 17, 'bellman-ford-floyd-warshall'),
(18, 4, 'Disjoint Set Union & Kruskal Algorithm', 'Union-by-rank and path-compression DSU coupled with greedy Minimum Spanning Tree construction.', 18, 'kruskal-algorithm-dsu'),
(19, 4, 'Topological Sort & Kahn Algorithm', 'Linear ordering of vertices in Directed Acyclic Graphs (DAGs) and in-degree cycle detection.', 19, 'topological-sort-kahn'),
(20, 5, '1D Dynamic Programming', 'Subproblem memoization and bottom-up state transition over one-dimensional parameter spaces.', 20, '1d-dynamic-programming'),
(21, 5, '2D Dynamic Programming & Knapsack', 'Decision grids, 0/1 Knapsack optimization, and bounded resource allocation states.', 21, '2d-dp-knapsack'),
(22, 5, 'Longest Common Subsequence & Edit Distance', 'String alignment and transformation algorithms using 2D state matrices.', 22, 'lcs-edit-distance'),
(23, 5, 'Greedy Algorithms & Interval Scheduling', 'Locally optimal choice heuristics for activity selection, interval overlap, and fractional knapsack.', 23, 'greedy-interval-scheduling'),
(24, 5, 'Backtracking & State Space Trees', 'Systematic exhaustive search pruning dead-end branches for permutations, subsets, and N-Queens.', 24, 'backtracking-state-space')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Topic Videos
INSERT INTO topic_videos (id, topic_id, youtube_url, title, sequence_number) VALUES
(1, 1, 'https://www.youtube.com/watch?v=g-PGLbMth_g', 'Bubble Sort and Selection Sort Explained', 1),
(2, 2, 'https://www.youtube.com/watch?v=JU767SDMDvA', 'Insertion Sort Algorithm & Visualization', 1),
(3, 3, 'https://www.youtube.com/watch?v=4VqmGXwpLqc', 'Merge Sort Full Deep Dive - Divide & Conquer', 1),
(4, 4, 'https://www.youtube.com/watch?v=WprjBK0p6rw', 'Quick Sort Algorithm Explained Step-by-Step', 1),
(5, 5, 'https://www.youtube.com/watch?v=s4DPM8ct1pI', 'Binary Search and Two Pointer Strategy', 1),
(6, 6, 'https://www.youtube.com/watch?v=F8AbOfQwl1c', 'Linked List Data Structure & Implementation', 1),
(7, 7, 'https://www.youtube.com/watch?v=D6xkbGLQesk', 'Monotonic Stack Pattern & Applications', 1),
(8, 8, 'https://www.youtube.com/watch?v=okr-XE8yTO8', 'Queues and Deques in Depth', 1),
(9, 9, 'https://www.youtube.com/watch?v=MK-NZ4hN7Rs', 'Sliding Window Pattern Masterclass', 1),
(10, 10, 'https://www.youtube.com/watch?v=shs0KM3wKv8', 'Hash Tables and Collision Resolution', 1),
(11, 11, 'https://www.youtube.com/watch?v=b_N49Ewg19k', 'Binary Tree Traversals (BFS & DFS)', 1),
(12, 12, 'https://www.youtube.com/watch?v=pYT9F8_LFTM', 'Binary Search Tree Operations', 1),
(13, 13, 'https://www.youtube.com/watch?v=HqPJF2L5h9U', 'Heap and Priority Queue Visualization', 1),
(14, 14, 'https://www.youtube.com/watch?v=o6563IIjpFc', 'Trie Data Structure Implementation', 1),
(15, 15, 'https://www.youtube.com/watch?v=pcKY4hjDrxk', 'Breadth First Search and Depth First Search Graphs', 1),
(16, 16, 'https://www.youtube.com/watch?v=XB4MIexjvY0', 'Dijkstra Shortest Path Algorithm Tutorial', 1),
(17, 17, 'https://www.youtube.com/watch?v=FtN3BYH2Zes', 'Bellman-Ford Algorithm with Negative Weights', 1),
(18, 18, 'https://www.youtube.com/watch?v=4ZlFXDu9978', 'Kruskal Algorithm & Disjoint Set Union', 1),
(19, 19, 'https://www.youtube.com/watch?v=cIBFEhD77-4', 'Topological Sort and Kahn Algorithm', 1),
(20, 20, 'https://www.youtube.com/watch?v=Hdr64lKQ3e4', '1D Dynamic Programming Step by Step', 1),
(21, 21, 'https://www.youtube.com/watch?v=xOlhR_2QCXY', '0/1 Knapsack Problem Dynamic Programming', 1),
(22, 22, 'https://www.youtube.com/watch?v=Ua0GhsJSlWM', 'Longest Common Subsequence DP', 1),
(23, 23, 'https://www.youtube.com/watch?v=bC7o8P_Ste4', 'Greedy Algorithms & Interval Scheduling', 1),
(24, 24, 'https://www.youtube.com/watch?v=wGbuCyNpCW4', 'Backtracking Pattern: N-Queens & Subsets', 1)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Practice Problems
INSERT INTO practice_problems (id, topic_id, title, platform, external_url, difficulty, problem_type) VALUES
(1, 1, 'Sort Colors', 'LeetCode', 'https://leetcode.com/problems/sort-colors/', 'Medium', 'Array Sorting'),
(2, 2, 'Insertion Sort List', 'LeetCode', 'https://leetcode.com/problems/insertion-sort-list/', 'Medium', 'Linked List Sorting'),
(3, 3, 'Sort an Array', 'LeetCode', 'https://leetcode.com/problems/sort-an-array/', 'Medium', 'Divide and Conquer'),
(4, 4, 'Kth Largest Element in an Array', 'LeetCode', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', 'Medium', 'Quickselect Partition'),
(5, 5, 'Binary Search', 'LeetCode', 'https://leetcode.com/problems/binary-search/', 'Easy', 'Two Pointers'),
(6, 6, 'Reverse Linked List', 'LeetCode', 'https://leetcode.com/problems/reverse-linked-list/', 'Easy', 'Pointer Manipulation'),
(7, 7, 'Daily Temperatures', 'LeetCode', 'https://leetcode.com/problems/daily-temperatures/', 'Medium', 'Monotonic Stack'),
(8, 8, 'Design Circular Deque', 'LeetCode', 'https://leetcode.com/problems/design-circular-deque/', 'Medium', 'Ring Buffer'),
(9, 9, 'Longest Substring Without Repeating Characters', 'LeetCode', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'Medium', 'Sliding Window'),
(10, 10, 'Design HashMap', 'LeetCode', 'https://leetcode.com/problems/design-hashmap/', 'Easy', 'Hashing & Chaining'),
(11, 11, 'Binary Tree Level Order Traversal', 'LeetCode', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', 'Medium', 'Tree BFS'),
(12, 12, 'Validate Binary Search Tree', 'LeetCode', 'https://leetcode.com/problems/validate-binary-search-tree/', 'Medium', 'BST Invariant'),
(13, 13, 'Top K Frequent Elements', 'LeetCode', 'https://leetcode.com/problems/top-k-frequent-elements/', 'Medium', 'Min Heap'),
(14, 14, 'Implement Trie (Prefix Tree)', 'LeetCode', 'https://leetcode.com/problems/implement-trie-prefix-tree/', 'Medium', 'Trie Data Structure'),
(15, 15, 'Number of Islands', 'LeetCode', 'https://leetcode.com/problems/number-of-islands/', 'Medium', 'Graph BFS/DFS'),
(16, 16, 'Network Delay Time', 'LeetCode', 'https://leetcode.com/problems/network-delay-time/', 'Medium', 'Dijkstra Shortest Path'),
(17, 17, 'Cheapest Flights Within K Stops', 'LeetCode', 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', 'Medium', 'Bellman-Ford / BFS'),
(18, 18, 'Min Cost to Connect All Points', 'LeetCode', 'https://leetcode.com/problems/min-cost-to-connect-all-points/', 'Medium', 'Kruskal MST & DSU'),
(19, 19, 'Course Schedule II', 'LeetCode', 'https://leetcode.com/problems/course-schedule-ii/', 'Medium', 'Topological Sort Kahn'),
(20, 20, 'Climbing Stairs', 'LeetCode', 'https://leetcode.com/problems/climbing-stairs/', 'Easy', '1D DP'),
(21, 21, 'Partition Equal Subset Sum', 'LeetCode', 'https://leetcode.com/problems/partition-equal-subset-sum/', 'Medium', '0/1 Knapsack'),
(22, 22, 'Longest Common Subsequence', 'LeetCode', 'https://leetcode.com/problems/longest-common-subsequence/', 'Medium', '2D DP Matrix'),
(23, 23, 'Non-overlapping Intervals', 'LeetCode', 'https://leetcode.com/problems/non-overlapping-intervals/', 'Medium', 'Greedy Activity Selection'),
(24, 24, 'N-Queens', 'LeetCode', 'https://leetcode.com/problems/n-queens/', 'Hard', 'Backtracking')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Default Users (Password is 'password123', hashed with BCrypt)
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Demo Student', 'student@codepath.edu', '$2a$10$wN1QeYjE8LhI4Y8P1.bE7OdR8bA6836yDcr2rR0o.qT9n28V72Rma', 'ROLE_STUDENT'),
(2, 'Platform Admin', 'admin@codepath.edu', '$2a$10$wN1QeYjE8LhI4Y8P1.bE7OdR8bA6836yDcr2rR0o.qT9n28V72Rma', 'ROLE_ADMIN')
ON CONFLICT (id) DO NOTHING;
