-- ============================================================================
-- The topic catalog: every topic, its lesson content and practice problems.
--
-- A Flyway "repeatable" migration (R__): it runs after the versioned ones, and
-- again whenever this file changes, so editing content here and restarting the
-- backend updates the database. Every statement is safe to run again.
--
-- 24 topics: the app's original 9, plus the 15 from the team's backend topic
-- list that weren't covered yet (Dijkstra, Kruskal, Merge Sort, ...). Its
-- practice problems and the YouTube links that still work are kept here.
-- ============================================================================

-- Topics: insert new ones, update existing ones (matched by slug).
INSERT INTO topics (slug, title, category, description, level, lesson_count, read_time, icon, color, theory, tip, pseudocode, sort_order)
VALUES
    ('arrays', 'Arrays', 'Data Structures', 'Store, access and traverse elements kept side by side in memory.', 'Beginner', 12, '10–15 min read', 'Brackets', 'purple', 'An array stores elements in one contiguous block of memory. Because every element takes the same amount of space, the position of any element can be calculated directly from its index, which makes reading arr[i] a constant-time operation. The trade-off is that inserting or deleting in the middle means shifting every element after it.', 'Many array problems can be solved in a single pass with two pointers, a sliding window or a running prefix sum. Look for those patterns before reaching for nested loops.', 'function linearSearch(array, target)
    for i = 0 to length(array) - 1
        if array[i] == target
            return i

    return -1', 1),
    ('strings', 'Strings', 'Data Structures', 'Pattern matching, two pointers and everyday text manipulation.', 'Beginner', 10, '10–15 min read', 'Type', 'blue', 'A string is a sequence of characters, usually stored much like an array of characters. In many languages, including JavaScript, Java and Python, strings are immutable: every change creates a new string, so building one character at a time in a loop can be slow. String problems often come down to comparing characters, counting them, or scanning with two pointers.', 'When a problem asks about anagrams or character counts, a frequency map (or a 26-slot array for lowercase letters) usually turns an O(n²) idea into O(n).', 'function isPalindrome(text)
    left = 0
    right = length(text) - 1

    while left < right
        if text[left] != text[right]
            return false
        left = left + 1
        right = right - 1

    return true', 2),
    ('binary-search-two-pointers', 'Binary Search & Two Pointers', 'Algorithm Techniques', 'Halve the search space each step, or walk two pointers towards each other.', 'Beginner', 6, '10–15 min read', 'Crosshair', 'green', 'Binary search finds a target in a sorted array by repeatedly halving the search range: compare the target with the middle element, then throw away the half that cannot contain it. Each step removes half of what is left, so even a million elements need only about 20 comparisons. The two-pointer technique is a close cousin: on sorted data, one pointer starts at each end and they move towards each other, turning many O(n²) pair searches into a single O(n) pass.', 'Binary search works on any yes/no question whose answer flips only once, not just on arrays. Searching on the answer ("can it be done with at most x?") solves many optimisation problems.', 'function binarySearch(array, target)
    low = 0
    high = length(array) - 1

    while low <= high
        middle = low + (high - low) / 2
        if array[middle] == target
            return middle
        else if array[middle] < target
            low = middle + 1
        else
            high = middle - 1

    return -1', 3),
    ('sliding-window', 'Sliding Window', 'Algorithm Techniques', 'Turn nested loops over subarrays into one linear pass.', 'Intermediate', 6, '15–20 min read', 'Columns3', 'pink', 'The sliding window technique solves problems about contiguous subarrays or substrings. Instead of checking every possible range from scratch, it keeps one window between a left and a right pointer: the right pointer grows the window, and the left pointer shrinks it whenever the window breaks the rule. Each element enters and leaves the window at most once, so a nested O(n²) loop becomes a single O(n) pass.', 'Ask what you need to know about the current window (a sum, character counts, a maximum) and how to update it in O(1) when one element enters or leaves.', 'function longestValidWindow(array)
    left = 0
    best = 0

    for right = 0 to length(array) - 1
        add array[right] to the window

        while the window is not valid
            remove array[left] from the window
            left = left + 1

        best = max(best, right - left + 1)

    return best', 4),
    ('linked-lists', 'Linked Lists', 'Data Structures', 'Chain nodes with pointers and master insertion and reversal.', 'Beginner', 8, '15–20 min read', 'Link', 'green', 'A linked list stores each element in a separate node that holds a value and a pointer to the next node. Nodes can live anywhere in memory, so inserting or removing a node only means updating a couple of pointers, with no shifting required. The cost is that there is no index: reaching the k-th node means walking from the head one step at a time.', 'Draw the pointers on paper before you code. Most linked-list bugs come from overwriting next before saving the node you still need.', 'function reverseList(head)
    previous = null
    current = head

    while current != null
        next = current.next
        current.next = previous
        previous = current
        current = next

    return previous', 5),
    ('stacks-queues', 'Stacks & Queues', 'Data Structures', 'The LIFO and FIFO structures behind undo, parsing and scheduling.', 'Intermediate', 9, '15–20 min read', 'Layers', 'orange', 'A stack is Last-In-First-Out: you push items on top and pop them from the top, like a pile of plates. A queue is First-In-First-Out: items join at the back and leave from the front, like a line at a counter. Both restrict where you can add and remove items, and that restriction is exactly what makes them fast and easy to reason about.', 'When a problem involves matching pairs or undoing the most recent action, think stack. When the order of arrival matters, think queue.', 'function isBalanced(expression)
    stack = empty stack

    for each char in expression
        if char is an opening bracket
            push char onto stack
        else if char is a closing bracket
            if stack is empty or pop(stack) does not match char
                return false

    return stack is empty', 6),
    ('hashing', 'Hashing', 'Data Structures', 'Constant-time lookups with hash maps and hash sets.', 'Intermediate', 7, '15–20 min read', 'Hash', 'pink', 'A hash table stores key–value pairs in an array of buckets. A hash function turns each key into a bucket index, so finding a key means computing its hash and looking in one place instead of scanning everything. When two keys land in the same bucket (a collision), the table still has to keep both, for example by storing a small list in each bucket.', 'If a brute-force solution checks every pair, ask whether storing what you have already seen in a hash map lets you answer each step in O(1).', 'function put(table, key, value)
    index = hash(key) mod size(table)
    bucket = table[index]

    for each entry in bucket
        if entry.key == key
            entry.value = value
            return

    append (key, value) to bucket', 7),
    ('bubble-sort', 'Bubble Sort', 'Sorting Algorithms', 'Learn how adjacent elements are compared and swapped until the array is sorted.', 'Beginner', 6, '10–15 min read', 'ArrowUpDown', 'green', 'Bubble Sort repeatedly compares adjacent elements and swaps them if they are in the wrong order. After each pass, the largest unsorted element reaches its correct position at the end of the array.', 'After each complete pass, the largest remaining element reaches the end of the unsorted section.', 'for i = 0 to n - 2
    swapped = false

    for j = 0 to n - i - 2
        if array[j] > array[j + 1]
            swap(array[j], array[j + 1])
            swapped = true

    if swapped == false
        break', 8),
    ('insertion-sort', 'Insertion Sort', 'Sorting Algorithms', 'Grow a sorted section one element at a time, like sorting playing cards.', 'Beginner', 5, '10–15 min read', 'ListOrdered', 'blue', 'Insertion Sort builds the sorted result one element at a time, the way many people sort a hand of playing cards. It keeps the left part of the array sorted. Each new element is taken out, the larger sorted elements are shifted one place to the right, and the element is dropped into the gap. On data that is already nearly sorted, very little shifting is needed, which makes it one of the fastest simple sorts in practice.', 'Insertion Sort is adaptive: its running time is O(n + d), where d is the number of out-of-order pairs. That is why hybrid sorts such as Timsort use it for short or nearly sorted runs.', 'for i = 1 to n - 1
    key = array[i]
    j = i - 1

    while j >= 0 and array[j] > key
        array[j + 1] = array[j]
        j = j - 1

    array[j + 1] = key', 9),
    ('merge-sort', 'Merge Sort', 'Sorting Algorithms', 'Divide and conquer: sort both halves, then merge them in one pass.', 'Intermediate', 7, '15–20 min read', 'GitMerge', 'purple', 'Merge Sort is a divide-and-conquer algorithm. It splits the array into two halves, sorts each half recursively, and then merges the two sorted halves by repeatedly taking the smaller of their front elements. Because the array is always split in half, there are about log n levels of splitting, and each level does O(n) work merging, so it runs in O(n log n) time however the input is arranged. It is also stable: equal elements keep their order.', 'The merge step is the whole trick: two sorted lists can be combined in one linear pass. The same idea merges k sorted lists and counts inversions in an array.', 'function mergeSort(array)
    if length(array) <= 1
        return array

    middle = length(array) / 2
    left = mergeSort(array[0 .. middle - 1])
    right = mergeSort(array[middle .. end])
    return merge(left, right)

function merge(left, right)
    result = empty list
    while left and right are both not empty
        if first(left) <= first(right)
            move first(left) to result
        else
            move first(right) to result

    append what is left of left and right to result
    return result', 10),
    ('quick-sort', 'Quick Sort', 'Sorting Algorithms', 'Partition around a pivot, then sort each side in place.', 'Intermediate', 7, '15–20 min read', 'Zap', 'orange', 'Quick Sort picks one element as the pivot and partitions the array so that smaller elements end up on its left and larger ones on its right. The pivot is then in its final position, and the same process is applied to the two sides. It sorts in place and is usually the fastest comparison sort in practice, but a consistently bad pivot (for example, always the smallest element) makes it degrade to O(n²).', 'Choose the pivot at random, or as the median of three elements, to make the O(n²) worst case extremely unlikely. Partitioning on its own also finds the k-th smallest element in average O(n): that is Quickselect.', 'function quickSort(array, low, high)
    if low < high
        p = partition(array, low, high)
        quickSort(array, low, p - 1)
        quickSort(array, p + 1, high)

function partition(array, low, high)
    pivot = array[high]
    i = low

    for j = low to high - 1
        if array[j] < pivot
            swap(array[i], array[j])
            i = i + 1

    swap(array[i], array[high])
    return i', 11),
    ('trees', 'Trees', 'Data Structures', 'Binary trees, BSTs and the traversals that power them.', 'Intermediate', 14, '20–25 min read', 'Network', 'purple', 'A tree is a hierarchy of nodes: one root at the top, and every other node has exactly one parent. In a binary tree each node has at most two children, left and right. A binary search tree adds an ordering rule (smaller values to the left, larger to the right), so when the tree is balanced each comparison lets you skip half of what remains.', 'Most tree problems are recursive: solve the problem for the left and right subtrees, then combine the two answers at the current node.', 'function inorder(node)
    if node == null
        return

    inorder(node.left)
    visit(node)
    inorder(node.right)', 12),
    ('heaps-priority-queues', 'Heaps & Priority Queues', 'Data Structures', 'Always get the smallest or largest item next, in O(log n).', 'Intermediate', 8, '15–20 min read', 'Triangle', 'orange', 'A binary heap is a complete binary tree in which every parent is smaller than its children (a min-heap) or larger than them (a max-heap), so the smallest or largest element is always at the root. Because the tree is complete, it fits neatly in an array: the children of index i are at 2i + 1 and 2i + 2. A priority queue is the idea of "always take the most urgent item next", and a heap is the usual way to build one.', 'For "top k" problems, keep a heap of size k: a min-heap holding the k largest items seen so far. That costs O(n log k) instead of sorting everything in O(n log n).', 'function push(heap, value)
    append value to heap
    i = length(heap) - 1
    while i > 0 and heap[(i - 1) / 2] > heap[i]
        swap(heap[i], heap[(i - 1) / 2])
        i = (i - 1) / 2

function pop(heap)
    smallest = heap[0]
    move the last element of heap to heap[0]
    i = 0
    while a child of i (at 2i + 1 or 2i + 2) is smaller than heap[i]
        c = the smaller child of i
        swap(heap[i], heap[c])
        i = c
    return smallest', 13),
    ('trie', 'Trie (Prefix Tree)', 'Data Structures', 'A tree of characters that answers prefix questions fast.', 'Intermediate', 6, '15–20 min read', 'ListTree', 'green', 'A trie stores a set of strings as a tree of characters. Each edge stands for one character, so every path from the root spells out a prefix, and a flag on a node marks where a complete word ends. Words that share a prefix share the same path. That makes prefix questions such as "which words start with app?" fast: the cost depends on the length of the word, not on how many words are stored.', 'When a problem talks about prefixes, autocomplete or searching for many words at once (like words in a letter grid), think trie. For lowercase English, each node can hold an array of 26 children.', 'function insert(root, word)
    node = root
    for each char in word
        if node.children[char] does not exist
            node.children[char] = new node
        node = node.children[char]
    node.isWord = true

function startsWith(root, prefix)
    node = root
    for each char in prefix
        if node.children[char] does not exist
            return false
        node = node.children[char]
    return true', 14),
    ('graphs', 'Graphs', 'Graph Algorithms', 'Model connections and explore them with BFS and DFS.', 'Advanced', 12, '25–30 min read', 'Waypoints', 'blue', 'A graph is a set of vertices connected by edges. Edges can be directed or undirected, weighted or unweighted, and graphs are usually stored as an adjacency list that maps each vertex to its neighbours. Breadth-first search (BFS) explores level by level using a queue, while depth-first search (DFS) follows one path as deep as possible before backtracking.', 'Always track visited vertices. Unlike trees, graphs can contain cycles, and forgetting the visited set leads to infinite loops.', 'function bfs(graph, start)
    queue = [start]
    visited = { start }

    while queue is not empty
        vertex = dequeue(queue)
        visit(vertex)

        for each neighbour of vertex in graph
            if neighbour is not in visited
                add neighbour to visited
                enqueue(queue, neighbour)', 15),
    ('topological-sort', 'Topological Sort', 'Graph Algorithms', 'Order tasks so every dependency comes first, with Kahn''s algorithm.', 'Advanced', 6, '15–20 min read', 'Workflow', 'purple', 'A topological sort orders the vertices of a directed acyclic graph (DAG) so that every edge points forward: if there is an edge from A to B, A comes before B. It models dependencies, such as courses with prerequisites or steps in a build. Kahn''s algorithm repeatedly takes a vertex with no remaining incoming edges, outputs it, and removes its outgoing edges. If some vertices are never freed, the graph has a cycle and no valid order exists.', 'Count the vertices you output. If there are fewer than the number of vertices, the graph has a cycle: this is the standard way to detect cycles in a directed graph.', 'function topologicalSort(graph)
    inDegree = number of incoming edges for every vertex
    queue = every vertex whose inDegree is 0
    order = empty list

    while queue is not empty
        vertex = dequeue(queue)
        append vertex to order
        for each neighbour of vertex
            inDegree[neighbour] = inDegree[neighbour] - 1
            if inDegree[neighbour] == 0
                enqueue(queue, neighbour)

    if length(order) < number of vertices
        return "the graph has a cycle"
    return order', 16),
    ('dijkstra', 'Dijkstra''s Algorithm', 'Graph Algorithms', 'Shortest paths from one vertex when no edge weight is negative.', 'Advanced', 8, '20–25 min read', 'Route', 'blue', 'Dijkstra''s algorithm finds the shortest path from one start vertex to every other vertex in a graph whose edge weights are never negative. It keeps a tentative distance for each vertex and always settles the closest unsettled vertex next, using a priority queue. Once a vertex is settled no shorter path to it can appear, because any other route would have to continue from a vertex that is already at least as far away. That argument breaks with negative edges, which is why Bellman-Ford exists.', 'With a priority queue, the same vertex can be pushed several times with different distances. When you pop an entry whose distance is larger than the best one known, it is out of date: skip it.', 'function dijkstra(graph, start)
    distance = infinity for every vertex
    distance[start] = 0
    heap = [(0, start)]

    while heap is not empty
        (d, u) = pop the smallest entry from heap
        if d > distance[u]
            continue

        for each (v, weight) in graph[u]
            if distance[u] + weight < distance[v]
                distance[v] = distance[u] + weight
                push (distance[v], v) onto heap

    return distance', 17),
    ('bellman-ford-floyd-warshall', 'Bellman-Ford & Floyd-Warshall', 'Graph Algorithms', 'Shortest paths with negative edges, and between every pair of vertices.', 'Advanced', 7, '20–25 min read', 'Signpost', 'pink', 'Bellman-Ford finds shortest paths from one start vertex even when some edge weights are negative. It relaxes every edge V - 1 times: a shortest path uses at most V - 1 edges, so after that many rounds every distance is correct. If one more round can still shorten a distance, the graph has a negative cycle and shortest paths are not defined. Floyd-Warshall answers the all-pairs question instead: for each vertex k in turn, it checks whether going through k shortens the path between every pair i and j.', 'Bellman-Ford with only k + 1 rounds gives the cheapest path that uses at most k + 1 edges, which is exactly what "cheapest flight with at most k stops" asks. Copy the distances at the start of each round, so a round can''t build on edges it relaxed itself.', 'function bellmanFord(vertices, edges, start)
    distance = infinity for every vertex
    distance[start] = 0

    repeat length(vertices) - 1 times
        for each (u, v, weight) in edges
            if distance[u] + weight < distance[v]
                distance[v] = distance[u] + weight

    for each (u, v, weight) in edges
        if distance[u] + weight < distance[v]
            return "negative cycle"

    return distance', 18),
    ('kruskal-union-find', 'Kruskal''s Algorithm & Union-Find', 'Graph Algorithms', 'Build a minimum spanning tree, using disjoint sets to avoid cycles.', 'Advanced', 7, '20–25 min read', 'Combine', 'green', 'A minimum spanning tree (MST) connects all the vertices of a weighted, undirected graph with the smallest possible total edge weight and no cycles. Kruskal''s algorithm sorts the edges from lightest to heaviest and adds each one unless it would close a cycle. To check for cycles quickly it uses a union-find (disjoint set union) structure, which tracks which vertices are already connected: an edge between two vertices in the same set would close a cycle.', 'Union-find needs two tricks to be fast: path compression (point every node you pass straight at its root) and union by rank or size (attach the smaller tree under the larger). Together they make each operation almost O(1).', 'function find(parent, x)
    if parent[x] != x
        parent[x] = find(parent, parent[x])
    return parent[x]

function kruskal(vertices, edges)
    sort edges by weight
    parent[v] = v for every vertex
    tree = empty list

    for each (u, v, weight) in edges
        rootU = find(parent, u)
        rootV = find(parent, v)
        if rootU != rootV
            parent[rootU] = rootV
            append (u, v, weight) to tree

    return tree', 19),
    ('dynamic-programming', 'Dynamic Programming', 'Algorithm Techniques', 'Break problems into overlapping subproblems and reuse the answers.', 'Advanced', 15, '25–30 min read', 'Grid3x3', 'orange', 'Dynamic programming solves a problem by breaking it into smaller subproblems, solving each one once, and storing the answer so it is never recomputed. It works when subproblems overlap and the best answer can be built from the best answers to smaller pieces. You can work top-down with recursion and memoisation, or bottom-up by filling a table from the smallest case.', 'Start by naming the state: what exactly does dp[i] mean? Once that sentence is clear, the recurrence and the table usually follow.', 'function climbStairs(n)
    ways = array of size n + 1
    ways[0] = 1
    ways[1] = 1

    for i = 2 to n
        ways[i] = ways[i - 1] + ways[i - 2]

    return ways[n]', 20),
    ('knapsack-2d-dp', '2D DP & 0/1 Knapsack', 'Algorithm Techniques', 'Dynamic programming over two dimensions: items and capacity.', 'Advanced', 8, '25–30 min read', 'Backpack', 'purple', 'Some problems need two numbers to describe a subproblem, so their dynamic programming table has two dimensions. The classic example is the 0/1 knapsack: given items with weights and values and a bag with a weight limit, choose items (each at most once) to get the most total value. dp[i][w] is the best value using the first i items with capacity w. Each item gives only two choices, skip it or take it, and the answer is the better of the two.', 'When each row only reads the row above it, keep a single 1D array instead of the table. For 0/1 knapsack, loop the capacity from high to low, so an item can''t be counted twice.', 'function knapsack(weights, values, capacity)
    n = length(weights)
    dp = table with n + 1 rows and capacity + 1 columns, all 0

    for i = 1 to n
        for w = 0 to capacity
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w
                take = dp[i - 1][w - weights[i - 1]] + values[i - 1]
                dp[i][w] = max(dp[i][w], take)

    return dp[n][capacity]', 21),
    ('lcs-edit-distance', 'LCS & Edit Distance', 'Algorithm Techniques', 'Compare two strings with a 2D table of prefixes.', 'Advanced', 6, '20–25 min read', 'Diff', 'blue', 'Many string problems compare two strings with a 2D table where dp[i][j] describes the first i characters of one string and the first j characters of the other. The longest common subsequence (LCS) is the longest sequence of characters that appears in both strings in the same order, though not necessarily side by side. Edit distance is the smallest number of inserts, deletes and replacements that turn one string into the other. Both fill the table from shorter prefixes to longer ones, and tools like diff and spell checkers are built on them.', 'Look at the last characters of the two prefixes. If they match, the answer builds on dp[i - 1][j - 1]; if they don''t, try each possible move and keep the best one.', 'function lcs(a, b)
    dp = table with length(a) + 1 rows and length(b) + 1 columns, all 0

    for i = 1 to length(a)
        for j = 1 to length(b)
            if a[i - 1] == b[j - 1]
                dp[i][j] = dp[i - 1][j - 1] + 1
            else
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[length(a)][length(b)]', 22),
    ('greedy-algorithms', 'Greedy Algorithms', 'Algorithm Techniques', 'Take the best-looking choice at every step, when that is provably enough.', 'Intermediate', 6, '15–20 min read', 'Coins', 'orange', 'A greedy algorithm builds a solution step by step, always taking the choice that looks best right now and never going back. That is only correct when a locally best choice can always be extended to a globally best answer. Interval scheduling is the classic example: to fit as many non-overlapping meetings as possible into one room, always pick the meeting that ends earliest, because it leaves the most time for the rest.', 'Before trusting a greedy rule, look for a counterexample. Greedy coin change works for coins 1, 5, 10 and 25, but fails for 1, 3 and 4 with amount 6: greedy gives 4 + 1 + 1, while 3 + 3 uses fewer coins.', 'function maxNonOverlapping(intervals)
    sort intervals by end time
    count = 0
    lastEnd = -infinity

    for each (start, end) in intervals
        if start >= lastEnd
            count = count + 1
            lastEnd = end

    return count', 23),
    ('backtracking', 'Backtracking', 'Algorithm Techniques', 'Try every choice, undo it, and prune branches that can''t work.', 'Advanced', 8, '20–25 min read', 'Undo2', 'pink', 'Backtracking explores every possible solution by building it one choice at a time, and undoing the last choice when it leads nowhere. You can picture the choices as a tree: each level makes one more choice, and each leaf is a complete candidate. The power comes from pruning. As soon as a partial solution breaks a rule (two queens attack each other, a sum is already too large), the whole branch below it is skipped.', 'Every backtracking function has the same shape: if the current state is complete, record it; otherwise, for each choice, make it, recurse, then undo it. Most bugs come from forgetting the undo.', 'function subsets(items)
    result = empty list
    path = empty list
    explore(0)
    return result

function explore(index)
    if index == length(items)
        append a copy of path to result
        return

    explore(index + 1)

    append items[index] to path
    explore(index + 1)
    remove the last element of path', 24)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    level = EXCLUDED.level,
    lesson_count = EXCLUDED.lesson_count,
    read_time = EXCLUDED.read_time,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    theory = EXCLUDED.theory,
    tip = EXCLUDED.tip,
    pseudocode = EXCLUDED.pseudocode,
    sort_order = EXCLUDED.sort_order;

-- Topics removed from this file are removed from the app (with their progress).
DELETE FROM topics WHERE slug NOT IN ('arrays', 'strings', 'binary-search-two-pointers', 'sliding-window', 'linked-lists', 'stacks-queues', 'hashing', 'bubble-sort', 'insertion-sort', 'merge-sort', 'quick-sort', 'trees', 'heaps-priority-queues', 'trie', 'graphs', 'topological-sort', 'dijkstra', 'bellman-ford-floyd-warshall', 'kruskal-union-find', 'dynamic-programming', 'knapsack-2d-dp', 'lcs-edit-distance', 'greedy-algorithms', 'backtracking');

-- The ordered lists inside each topic. No user data points at these rows, so
-- they are simply rebuilt.
DELETE FROM topic_structures;
DELETE FROM topic_steps;
DELETE FROM topic_complexities;
DELETE FROM topic_resources;

INSERT INTO topic_structures (topic_id, position, name)
SELECT t.id, v.position, v.name
FROM (VALUES
    ('arrays', 0, 'Array'),
    ('strings', 0, 'String'),
    ('binary-search-two-pointers', 0, 'Array'),
    ('sliding-window', 0, 'Array'),
    ('sliding-window', 1, 'String'),
    ('linked-lists', 0, 'Linked List'),
    ('stacks-queues', 0, 'Stack'),
    ('stacks-queues', 1, 'Queue'),
    ('hashing', 0, 'Hash Table'),
    ('bubble-sort', 0, 'Array'),
    ('insertion-sort', 0, 'Array'),
    ('merge-sort', 0, 'Array'),
    ('quick-sort', 0, 'Array'),
    ('trees', 0, 'Tree'),
    ('heaps-priority-queues', 0, 'Heap'),
    ('heaps-priority-queues', 1, 'Array'),
    ('trie', 0, 'Tree'),
    ('trie', 1, 'String'),
    ('graphs', 0, 'Graph'),
    ('graphs', 1, 'Queue'),
    ('topological-sort', 0, 'Graph'),
    ('topological-sort', 1, 'Queue'),
    ('dijkstra', 0, 'Graph'),
    ('dijkstra', 1, 'Heap'),
    ('bellman-ford-floyd-warshall', 0, 'Graph'),
    ('bellman-ford-floyd-warshall', 1, 'Matrix'),
    ('kruskal-union-find', 0, 'Graph'),
    ('kruskal-union-find', 1, 'Disjoint Set'),
    ('dynamic-programming', 0, 'Array'),
    ('knapsack-2d-dp', 0, 'Matrix'),
    ('knapsack-2d-dp', 1, 'Array'),
    ('lcs-edit-distance', 0, 'String'),
    ('lcs-edit-distance', 1, 'Matrix'),
    ('greedy-algorithms', 0, 'Array'),
    ('backtracking', 0, 'Array'),
    ('backtracking', 1, 'Tree')
) AS v (slug, position, name)
JOIN topics t ON t.slug = v.slug;

INSERT INTO topic_steps (topic_id, position, content)
SELECT t.id, v.position, v.content
FROM (VALUES
    ('arrays', 0, 'Memory is reserved for all the elements in one continuous block.'),
    ('arrays', 1, 'Each element is identified by its index, starting at 0.'),
    ('arrays', 2, 'The address of arr[i] is base address + i × element size.'),
    ('arrays', 3, 'So reading or updating any index takes the same time.'),
    ('arrays', 4, 'Inserting or deleting in the middle shifts every later element.'),
    ('strings', 0, 'Place one pointer at the start of the string and one at the end.'),
    ('strings', 1, 'Compare the characters under both pointers.'),
    ('strings', 2, 'If they differ, the string is not a palindrome.'),
    ('strings', 3, 'If they match, move both pointers toward the middle.'),
    ('strings', 4, 'When the pointers meet, every pair has matched.'),
    ('binary-search-two-pointers', 0, 'Set low to the first index and high to the last.'),
    ('binary-search-two-pointers', 1, 'Look at the middle index between low and high.'),
    ('binary-search-two-pointers', 2, 'If the middle element is the target, you are done.'),
    ('binary-search-two-pointers', 3, 'If it is smaller than the target, move low past the middle; otherwise move high before it.'),
    ('binary-search-two-pointers', 4, 'When low passes high, the target is not in the array.'),
    ('sliding-window', 0, 'Start with an empty window: left = 0.'),
    ('sliding-window', 1, 'Move right one step and add the new element to the window''s running state.'),
    ('sliding-window', 2, 'While the window breaks the rule, remove the element at left and move left forward.'),
    ('sliding-window', 3, 'The window is valid again: compare it with the best answer so far.'),
    ('sliding-window', 4, 'Repeat until right reaches the end.'),
    ('linked-lists', 0, 'Keep three pointers: previous (null), current (head) and next.'),
    ('linked-lists', 1, 'Save current.next so the rest of the list is not lost.'),
    ('linked-lists', 2, 'Point current.next back to previous.'),
    ('linked-lists', 3, 'Move previous and current one step forward.'),
    ('linked-lists', 4, 'When current is null, previous is the new head.'),
    ('stacks-queues', 0, 'Read the expression one character at a time.'),
    ('stacks-queues', 1, 'Push every opening bracket onto the stack.'),
    ('stacks-queues', 2, 'On a closing bracket, pop the top of the stack.'),
    ('stacks-queues', 3, 'If the stack was empty or the brackets do not match, it is unbalanced.'),
    ('stacks-queues', 4, 'At the end, the expression is balanced only if the stack is empty.'),
    ('hashing', 0, 'Pass the key through a hash function to get a number.'),
    ('hashing', 1, 'Take that number modulo the table size to pick a bucket.'),
    ('hashing', 2, 'To insert, add the key–value pair to that bucket.'),
    ('hashing', 3, 'To look up, hash the key again and search only that bucket.'),
    ('hashing', 4, 'When the table gets too full, resize it and rehash every key.'),
    ('bubble-sort', 0, 'Start with the first two elements.'),
    ('bubble-sort', 1, 'Compare the adjacent elements.'),
    ('bubble-sort', 2, 'Swap them if the left element is greater than the right.'),
    ('bubble-sort', 3, 'Continue until the end of the unsorted portion.'),
    ('bubble-sort', 4, 'Repeat until no swaps are required.'),
    ('insertion-sort', 0, 'Treat the first element as a sorted section of length one.'),
    ('insertion-sort', 1, 'Take the next element as the key to insert.'),
    ('insertion-sort', 2, 'Shift every sorted element larger than the key one place to the right.'),
    ('insertion-sort', 3, 'Place the key in the gap that opens up.'),
    ('insertion-sort', 4, 'Repeat until every element has joined the sorted section.'),
    ('merge-sort', 0, 'If the array has zero or one element, it is already sorted.'),
    ('merge-sort', 1, 'Split the array into a left half and a right half.'),
    ('merge-sort', 2, 'Recursively sort the left half and the right half.'),
    ('merge-sort', 3, 'Merge: compare the front elements of both halves and take the smaller one.'),
    ('merge-sort', 4, 'When one half runs out, copy the rest of the other half.'),
    ('quick-sort', 0, 'Pick a pivot, for example the last element.'),
    ('quick-sort', 1, 'Walk through the array, moving every element smaller than the pivot to the front.'),
    ('quick-sort', 2, 'Swap the pivot into the position right after those smaller elements.'),
    ('quick-sort', 3, 'The pivot is now in its final sorted position.'),
    ('quick-sort', 4, 'Recursively sort the part left of the pivot and the part right of it.'),
    ('trees', 0, 'Start at the root node.'),
    ('trees', 1, 'Recursively visit the entire left subtree.'),
    ('trees', 2, 'Visit the current node and record its value.'),
    ('trees', 3, 'Recursively visit the entire right subtree.'),
    ('trees', 4, 'In a binary search tree, this visits the values in sorted order.'),
    ('heaps-priority-queues', 0, 'To insert, add the new element at the end of the array.'),
    ('heaps-priority-queues', 1, 'Sift up: while it is smaller than its parent, swap it with the parent.'),
    ('heaps-priority-queues', 2, 'To remove the minimum, take the root and move the last element into its place.'),
    ('heaps-priority-queues', 3, 'Sift down: swap that element with its smaller child while it is larger than that child.'),
    ('heaps-priority-queues', 4, 'Both operations follow one path in a tree of height log n.'),
    ('trie', 0, 'Start at the root node, which stands for the empty prefix.'),
    ('trie', 1, 'For each character of the word, follow the child for that character.'),
    ('trie', 2, 'When inserting, create the child if it doesn''t exist yet.'),
    ('trie', 3, 'After the last character, mark the node as the end of a word.'),
    ('trie', 4, 'To search, follow the characters: the word exists only if the path exists and ends at a marked node.'),
    ('graphs', 0, 'Add the starting vertex to a queue and mark it visited.'),
    ('graphs', 1, 'Remove the vertex at the front of the queue.'),
    ('graphs', 2, 'Look at each of its neighbours.'),
    ('graphs', 3, 'Add every unvisited neighbour to the queue and mark it visited.'),
    ('graphs', 4, 'Repeat until the queue is empty.'),
    ('topological-sort', 0, 'Count the incoming edges (the in-degree) of every vertex.'),
    ('topological-sort', 1, 'Put every vertex with in-degree 0 into a queue.'),
    ('topological-sort', 2, 'Take a vertex from the queue and add it to the order.'),
    ('topological-sort', 3, 'Lower the in-degree of each of its neighbours, and queue any that reach 0.'),
    ('topological-sort', 4, 'When the queue is empty, the order is complete, unless a cycle left vertices behind.'),
    ('dijkstra', 0, 'Set the start''s distance to 0 and every other distance to infinity.'),
    ('dijkstra', 1, 'Put the start into a priority queue ordered by distance.'),
    ('dijkstra', 2, 'Pop the vertex with the smallest distance; skip it if that entry is out of date.'),
    ('dijkstra', 3, 'Relax each edge (u, v): if distance[u] + weight is shorter than distance[v], update it and push v.'),
    ('dijkstra', 4, 'Repeat until the queue is empty: every distance is now the shortest.'),
    ('bellman-ford-floyd-warshall', 0, 'Bellman-Ford: set the start''s distance to 0 and all the others to infinity.'),
    ('bellman-ford-floyd-warshall', 1, 'Relax every edge: if distance[u] + weight < distance[v], lower distance[v].'),
    ('bellman-ford-floyd-warshall', 2, 'Repeat that full pass V - 1 times.'),
    ('bellman-ford-floyd-warshall', 3, 'Run one more pass: any further improvement means a negative cycle.'),
    ('bellman-ford-floyd-warshall', 4, 'Floyd-Warshall: for each k, set dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).'),
    ('kruskal-union-find', 0, 'Sort all edges by weight, lightest first.'),
    ('kruskal-union-find', 1, 'Start with every vertex in a set of its own.'),
    ('kruskal-union-find', 2, 'Take the next edge (u, v) and find the set of u and the set of v.'),
    ('kruskal-union-find', 3, 'If the sets differ, add the edge to the tree and join the two sets.'),
    ('kruskal-union-find', 4, 'Stop once the tree has V - 1 edges.'),
    ('dynamic-programming', 0, 'Define the state: ways[i] is the number of ways to reach step i.'),
    ('dynamic-programming', 1, 'Find the recurrence: ways[i] = ways[i - 1] + ways[i - 2].'),
    ('dynamic-programming', 2, 'Set the base cases: ways[0] = 1 and ways[1] = 1.'),
    ('dynamic-programming', 3, 'Fill the table from the smallest step upward.'),
    ('dynamic-programming', 4, 'Return ways[n] as the final answer.'),
    ('knapsack-2d-dp', 0, 'Define dp[i][w]: the best value using the first i items with capacity w.'),
    ('knapsack-2d-dp', 1, 'Base case: with no items, every capacity is worth 0.'),
    ('knapsack-2d-dp', 2, 'Skip item i: dp[i][w] = dp[i - 1][w].'),
    ('knapsack-2d-dp', 3, 'If item i fits, taking it gives dp[i - 1][w - weight[i]] + value[i].'),
    ('knapsack-2d-dp', 4, 'Keep the larger of the two; the answer is dp[n][W].'),
    ('lcs-edit-distance', 0, 'Make a table with one more row than A has characters and one more column than B.'),
    ('lcs-edit-distance', 1, 'Fill the first row and column with 0: an empty string shares nothing.'),
    ('lcs-edit-distance', 2, 'If A[i] equals B[j], set dp[i][j] = dp[i - 1][j - 1] + 1.'),
    ('lcs-edit-distance', 3, 'Otherwise set dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]).'),
    ('lcs-edit-distance', 4, 'The bottom-right cell holds the length of the LCS.'),
    ('greedy-algorithms', 0, 'Decide the greedy rule, for example earliest end time first.'),
    ('greedy-algorithms', 1, 'Sort the intervals by their end time.'),
    ('greedy-algorithms', 2, 'Take the first interval and remember where it ends.'),
    ('greedy-algorithms', 3, 'Take each later interval only if it starts at or after that end.'),
    ('greedy-algorithms', 4, 'The intervals taken form a largest possible set with no overlaps.'),
    ('backtracking', 0, 'Start with an empty partial solution.'),
    ('backtracking', 1, 'If it is complete, record a copy of it and return.'),
    ('backtracking', 2, 'Otherwise, try each choice that keeps it valid.'),
    ('backtracking', 3, 'Recurse to extend the solution with that choice.'),
    ('backtracking', 4, 'Undo the choice, then try the next one.')
) AS v (slug, position, content)
JOIN topics t ON t.slug = v.slug;

INSERT INTO topic_complexities (topic_id, position, label, value, note)
SELECT t.id, v.position, v.label, v.value, v.note
FROM (VALUES
    ('arrays', 0, 'Access by index', 'O(1)', 'Address is calculated directly'),
    ('arrays', 1, 'Search', 'O(n)', 'Unsorted data needs a linear scan'),
    ('arrays', 2, 'Insert / delete', 'O(n)', 'Later elements must shift'),
    ('arrays', 3, 'Space', 'O(n)', 'One slot per element'),
    ('strings', 0, 'Access a character', 'O(1)', 'Indexed like an array'),
    ('strings', 1, 'Find a substring', 'O(n·m)', 'Naive matching of a length-m pattern'),
    ('strings', 2, 'Concatenate', 'O(n + m)', 'A new string is created'),
    ('strings', 3, 'Space', 'O(n)', 'One slot per character'),
    ('binary-search-two-pointers', 0, 'Binary search', 'O(log n)', 'Half the range is discarded each step'),
    ('binary-search-two-pointers', 1, 'Two pointers', 'O(n)', 'Each pointer moves at most n times'),
    ('binary-search-two-pointers', 2, 'Linear search', 'O(n)', 'What binary search improves on'),
    ('binary-search-two-pointers', 3, 'Space', 'O(1)', 'Only a few indices'),
    ('sliding-window', 0, 'Time', 'O(n)', 'Each element enters and leaves once'),
    ('sliding-window', 1, 'Brute force', 'O(n²)', 'Every start and end pair'),
    ('sliding-window', 2, 'Fixed-size window', 'O(n)', 'Add one, remove one per step'),
    ('sliding-window', 3, 'Space', 'O(k)', 'State for the window, e.g. character counts'),
    ('linked-lists', 0, 'Access', 'O(n)', 'Walk from the head'),
    ('linked-lists', 1, 'Search', 'O(n)', 'Linear scan of the nodes'),
    ('linked-lists', 2, 'Insert / delete', 'O(1)', 'Given a pointer to the position'),
    ('linked-lists', 3, 'Space', 'O(n)', 'One node per element'),
    ('stacks-queues', 0, 'Push / enqueue', 'O(1)', 'Add at one end'),
    ('stacks-queues', 1, 'Pop / dequeue', 'O(1)', 'Remove from one end'),
    ('stacks-queues', 2, 'Peek', 'O(1)', 'Read without removing'),
    ('stacks-queues', 3, 'Space', 'O(n)', 'One slot per item'),
    ('hashing', 0, 'Insert', 'O(1)', 'Average case'),
    ('hashing', 1, 'Lookup', 'O(1)', 'Average case'),
    ('hashing', 2, 'Worst case', 'O(n)', 'Every key collides in one bucket'),
    ('hashing', 3, 'Space', 'O(n)', 'One entry per key'),
    ('bubble-sort', 0, 'Best case', 'O(n)', 'Already sorted, with an early-exit check'),
    ('bubble-sort', 1, 'Average case', 'O(n²)', 'Repeated comparisons and swaps'),
    ('bubble-sort', 2, 'Worst case', 'O(n²)', 'Reverse-sorted input'),
    ('bubble-sort', 3, 'Space', 'O(1)', 'In-place sorting'),
    ('insertion-sort', 0, 'Best case', 'O(n)', 'Already sorted: one comparison per element'),
    ('insertion-sort', 1, 'Average case', 'O(n²)', 'About n²/4 shifts on random data'),
    ('insertion-sort', 2, 'Worst case', 'O(n²)', 'Reverse-sorted input shifts everything'),
    ('insertion-sort', 3, 'Space', 'O(1)', 'Sorts in place, and it is stable'),
    ('merge-sort', 0, 'Best case', 'O(n log n)', 'Always splits all the way down'),
    ('merge-sort', 1, 'Average case', 'O(n log n)', 'log n levels, O(n) merging per level'),
    ('merge-sort', 2, 'Worst case', 'O(n log n)', 'Guaranteed, unlike Quick Sort'),
    ('merge-sort', 3, 'Space', 'O(n)', 'Merging needs a temporary array'),
    ('quick-sort', 0, 'Best case', 'O(n log n)', 'The pivot splits the array evenly'),
    ('quick-sort', 1, 'Average case', 'O(n log n)', 'Random pivots split well on average'),
    ('quick-sort', 2, 'Worst case', 'O(n²)', 'The pivot is always the smallest or largest'),
    ('quick-sort', 3, 'Space', 'O(log n)', 'Recursion stack; sorts in place'),
    ('trees', 0, 'Search (balanced BST)', 'O(log n)', 'Half the tree is skipped each step'),
    ('trees', 1, 'Insert / delete', 'O(log n)', 'In a balanced BST'),
    ('trees', 2, 'Worst case', 'O(n)', 'A skewed tree behaves like a list'),
    ('trees', 3, 'Traversal', 'O(n)', 'Every node is visited once'),
    ('heaps-priority-queues', 0, 'Peek min / max', 'O(1)', 'It is always at the root'),
    ('heaps-priority-queues', 1, 'Insert', 'O(log n)', 'Sift up one path'),
    ('heaps-priority-queues', 2, 'Remove min / max', 'O(log n)', 'Sift down one path'),
    ('heaps-priority-queues', 3, 'Build from n items', 'O(n)', 'Sift down from the bottom up'),
    ('trie', 0, 'Insert', 'O(L)', 'L is the length of the word'),
    ('trie', 1, 'Search / prefix check', 'O(L)', 'However many words are stored'),
    ('trie', 2, 'Space', 'O(N·L)', 'At most one node per character inserted'),
    ('trie', 3, 'Prefix check in a list', 'O(N·L)', 'What a trie improves on'),
    ('graphs', 0, 'BFS / DFS', 'O(V + E)', 'Every vertex and edge once'),
    ('graphs', 1, 'Adjacency list', 'O(V + E)', 'Space for existing edges only'),
    ('graphs', 2, 'Adjacency matrix', 'O(V²)', 'Space for every vertex pair'),
    ('graphs', 3, 'Edge check (matrix)', 'O(1)', 'Direct cell lookup'),
    ('topological-sort', 0, 'Kahn''s algorithm', 'O(V + E)', 'Every vertex and edge once'),
    ('topological-sort', 1, 'DFS version', 'O(V + E)', 'Reverse order of finishing times'),
    ('topological-sort', 2, 'Space', 'O(V)', 'In-degrees and the queue'),
    ('topological-sort', 3, 'Cycle check', 'O(V + E)', 'Comes free with Kahn''s algorithm'),
    ('dijkstra', 0, 'With a binary heap', 'O((V + E) log V)', 'Each relaxed edge may push once'),
    ('dijkstra', 1, 'With a plain array', 'O(V²)', 'Better for very dense graphs'),
    ('dijkstra', 2, 'Space', 'O(V + E)', 'Distances, the heap and the graph'),
    ('dijkstra', 3, 'Negative edges', 'Not allowed', 'Use Bellman-Ford instead'),
    ('bellman-ford-floyd-warshall', 0, 'Bellman-Ford', 'O(V·E)', 'V - 1 passes over every edge'),
    ('bellman-ford-floyd-warshall', 1, 'Floyd-Warshall', 'O(V³)', 'Every pair, through every vertex'),
    ('bellman-ford-floyd-warshall', 2, 'Space (Floyd-Warshall)', 'O(V²)', 'One distance matrix'),
    ('bellman-ford-floyd-warshall', 3, 'Negative edges', 'Allowed', 'Negative cycles are detected'),
    ('kruskal-union-find', 0, 'Kruskal', 'O(E log E)', 'Sorting the edges dominates'),
    ('kruskal-union-find', 1, 'Find / union', 'O(α(n))', 'Almost constant with both tricks'),
    ('kruskal-union-find', 2, 'Space', 'O(V)', 'Parent and rank arrays'),
    ('kruskal-union-find', 3, 'Edges in the MST', 'V - 1', 'Any tree on V vertices has V - 1'),
    ('dynamic-programming', 0, 'Naive recursion', 'O(2ⁿ)', 'Same subproblems solved repeatedly'),
    ('dynamic-programming', 1, 'With memoisation', 'O(n)', 'Each step is solved once'),
    ('dynamic-programming', 2, 'Bottom-up table', 'O(n)', 'One pass over the states'),
    ('dynamic-programming', 3, 'Optimised space', 'O(1)', 'Keep only the last two answers'),
    ('knapsack-2d-dp', 0, 'Time', 'O(n·W)', 'One cell per item and capacity'),
    ('knapsack-2d-dp', 1, 'Space (table)', 'O(n·W)', 'The full 2D table'),
    ('knapsack-2d-dp', 2, 'Space (one row)', 'O(W)', 'Reuse a single array'),
    ('knapsack-2d-dp', 3, 'Brute force', 'O(2ⁿ)', 'Every subset of the items'),
    ('lcs-edit-distance', 0, 'Time', 'O(n·m)', 'One cell per pair of prefixes'),
    ('lcs-edit-distance', 1, 'Space', 'O(n·m)', 'The full table'),
    ('lcs-edit-distance', 2, 'Space (two rows)', 'O(min(n, m))', 'When only the length is needed'),
    ('lcs-edit-distance', 3, 'Brute force', 'O(2ⁿ)', 'Every subsequence of one string'),
    ('greedy-algorithms', 0, 'Interval scheduling', 'O(n log n)', 'Sorting dominates'),
    ('greedy-algorithms', 1, 'Greedy pass', 'O(n)', 'One look at each item'),
    ('greedy-algorithms', 2, 'Space', 'O(1)', 'Besides the sort'),
    ('greedy-algorithms', 3, 'Correctness', 'Needs proof', 'Greedy can be wrong without one'),
    ('backtracking', 0, 'Subsets', 'O(n·2ⁿ)', '2ⁿ subsets, each copied'),
    ('backtracking', 1, 'Permutations', 'O(n·n!)', 'n! orderings, each copied'),
    ('backtracking', 2, 'Space', 'O(n)', 'Recursion depth and the current path'),
    ('backtracking', 3, 'Pruning', 'Often huge', 'Skips whole branches early')
) AS v (slug, position, label, value, note)
JOIN topics t ON t.slug = v.slug;

INSERT INTO topic_resources (topic_id, position, title, source, url)
SELECT t.id, v.position, v.title, v.source, v.url
FROM (VALUES
    ('arrays', 0, 'Array (data structure)', 'Wikipedia', 'https://en.wikipedia.org/wiki/Array_(data_structure)'),
    ('arrays', 1, 'Arrays explained', 'YouTube search', 'https://www.youtube.com/results?search_query=array+data+structure+explained'),
    ('strings', 0, 'String (computer science)', 'Wikipedia', 'https://en.wikipedia.org/wiki/String_(computer_science)'),
    ('strings', 1, 'String problems with two pointers', 'YouTube search', 'https://www.youtube.com/results?search_query=string+two+pointers+technique'),
    ('binary-search-two-pointers', 0, 'Binary Search - Leetcode 704', 'YouTube · NeetCode', 'https://www.youtube.com/watch?v=s4DPM8ct1pI'),
    ('binary-search-two-pointers', 1, 'Binary search', 'Wikipedia', 'https://en.wikipedia.org/wiki/Binary_search'),
    ('binary-search-two-pointers', 2, 'Two Pointers Technique', 'GeeksforGeeks', 'https://www.geeksforgeeks.org/dsa/two-pointers-technique/'),
    ('binary-search-two-pointers', 3, 'Binary search explained', 'YouTube search', 'https://www.youtube.com/results?search_query=binary+search+algorithm+explained'),
    ('sliding-window', 0, 'Window Sliding Technique', 'GeeksforGeeks', 'https://www.geeksforgeeks.org/dsa/window-sliding-technique/'),
    ('sliding-window', 1, 'Sliding window technique explained', 'YouTube search', 'https://www.youtube.com/results?search_query=sliding+window+technique+explained'),
    ('linked-lists', 0, 'Linked list', 'Wikipedia', 'https://en.wikipedia.org/wiki/Linked_list'),
    ('linked-lists', 1, 'Linked lists explained', 'YouTube search', 'https://www.youtube.com/results?search_query=linked+list+data+structure+explained'),
    ('linked-lists', 2, 'Linked lists in 4 minutes', 'YouTube · Michael Sambol', 'https://www.youtube.com/watch?v=F8AbOfQwl1c'),
    ('stacks-queues', 0, 'Stack (abstract data type)', 'Wikipedia', 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)'),
    ('stacks-queues', 1, 'Queue (abstract data type)', 'Wikipedia', 'https://en.wikipedia.org/wiki/Queue_(abstract_data_type)'),
    ('stacks-queues', 2, 'Stacks and queues explained', 'YouTube search', 'https://www.youtube.com/results?search_query=stacks+and+queues+explained'),
    ('stacks-queues', 3, 'Array implementation of Queue', 'YouTube · mycodeschool', 'https://www.youtube.com/watch?v=okr-XE8yTO8'),
    ('hashing', 0, 'Hash table', 'Wikipedia', 'https://en.wikipedia.org/wiki/Hash_table'),
    ('hashing', 1, 'Hash tables explained', 'YouTube search', 'https://www.youtube.com/results?search_query=hash+table+explained'),
    ('hashing', 2, 'Data Structures: Hash Tables', 'YouTube · HackerRank', 'https://www.youtube.com/watch?v=shs0KM3wKv8'),
    ('bubble-sort', 0, 'Bubble Sort Algorithm', 'GeeksforGeeks', 'https://www.geeksforgeeks.org/bubble-sort-algorithm/'),
    ('bubble-sort', 1, 'Sorting algorithms explained', 'YouTube search', 'https://www.youtube.com/results?search_query=bubble+sort+algorithm+explained'),
    ('insertion-sort', 0, 'Insertion sort in 2 minutes', 'YouTube · Michael Sambol', 'https://www.youtube.com/watch?v=JU767SDMDvA'),
    ('insertion-sort', 1, 'Insertion sort', 'Wikipedia', 'https://en.wikipedia.org/wiki/Insertion_sort'),
    ('insertion-sort', 2, 'Insertion sort explained', 'YouTube search', 'https://www.youtube.com/results?search_query=insertion+sort+algorithm+explained'),
    ('merge-sort', 0, 'Merge sort in 3 minutes', 'YouTube · Michael Sambol', 'https://www.youtube.com/watch?v=4VqmGXwpLqc'),
    ('merge-sort', 1, 'Merge sort', 'Wikipedia', 'https://en.wikipedia.org/wiki/Merge_sort'),
    ('merge-sort', 2, 'Merge sort explained', 'YouTube search', 'https://www.youtube.com/results?search_query=merge+sort+algorithm+explained'),
    ('quick-sort', 0, 'Quick Sort Algorithm', 'YouTube · CuriousWalk', 'https://www.youtube.com/watch?v=WprjBK0p6rw'),
    ('quick-sort', 1, 'Quicksort', 'Wikipedia', 'https://en.wikipedia.org/wiki/Quicksort'),
    ('quick-sort', 2, 'Quick sort explained', 'YouTube search', 'https://www.youtube.com/results?search_query=quick+sort+algorithm+explained'),
    ('trees', 0, 'Binary tree', 'Wikipedia', 'https://en.wikipedia.org/wiki/Binary_tree'),
    ('trees', 1, 'Binary search tree', 'Wikipedia', 'https://en.wikipedia.org/wiki/Binary_search_tree'),
    ('trees', 2, 'Tree traversals explained', 'YouTube search', 'https://www.youtube.com/results?search_query=binary+tree+traversal+explained'),
    ('trees', 3, 'Data structures: Binary Search Tree', 'YouTube · mycodeschool', 'https://www.youtube.com/watch?v=pYT9F8_LFTM'),
    ('heaps-priority-queues', 0, 'Heap, Heap Sort, Heapify and Priority Queues', 'YouTube · Abdul Bari', 'https://www.youtube.com/watch?v=HqPJF2L5h9U'),
    ('heaps-priority-queues', 1, 'Binary heap', 'Wikipedia', 'https://en.wikipedia.org/wiki/Binary_heap'),
    ('heaps-priority-queues', 2, 'Priority queue', 'Wikipedia', 'https://en.wikipedia.org/wiki/Priority_queue'),
    ('heaps-priority-queues', 3, 'Heaps and priority queues explained', 'YouTube search', 'https://www.youtube.com/results?search_query=heap+priority+queue+explained'),
    ('trie', 0, 'Trie', 'Wikipedia', 'https://en.wikipedia.org/wiki/Trie'),
    ('trie', 1, 'Trie data structure explained', 'YouTube search', 'https://www.youtube.com/results?search_query=trie+data+structure+explained'),
    ('graphs', 0, 'Graph (abstract data type)', 'Wikipedia', 'https://en.wikipedia.org/wiki/Graph_(abstract_data_type)'),
    ('graphs', 1, 'Breadth-first search', 'Wikipedia', 'https://en.wikipedia.org/wiki/Breadth-first_search'),
    ('graphs', 2, 'BFS and DFS explained', 'YouTube search', 'https://www.youtube.com/results?search_query=bfs+and+dfs+graph+explained'),
    ('graphs', 3, 'Graph Traversals: BFS & DFS', 'YouTube · Abdul Bari', 'https://www.youtube.com/watch?v=pcKY4hjDrxk'),
    ('topological-sort', 0, 'Topological sorting', 'Wikipedia', 'https://en.wikipedia.org/wiki/Topological_sorting'),
    ('topological-sort', 1, 'Topological sort explained', 'YouTube search', 'https://www.youtube.com/results?search_query=topological+sort+kahn+algorithm'),
    ('dijkstra', 0, 'Dijkstra Algorithm: Single Source Shortest Path', 'YouTube · Abdul Bari', 'https://www.youtube.com/watch?v=XB4MIexjvY0'),
    ('dijkstra', 1, 'Dijkstra''s algorithm', 'Wikipedia', 'https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm'),
    ('dijkstra', 2, 'Dijkstra''s algorithm explained', 'YouTube search', 'https://www.youtube.com/results?search_query=dijkstra+algorithm+explained'),
    ('bellman-ford-floyd-warshall', 0, 'Bellman Ford Algorithm', 'YouTube · Abdul Bari', 'https://www.youtube.com/watch?v=FtN3BYH2Zes'),
    ('bellman-ford-floyd-warshall', 1, 'Bellman–Ford algorithm', 'Wikipedia', 'https://en.wikipedia.org/wiki/Bellman%E2%80%93Ford_algorithm'),
    ('bellman-ford-floyd-warshall', 2, 'Floyd–Warshall algorithm', 'Wikipedia', 'https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm'),
    ('bellman-ford-floyd-warshall', 3, 'Bellman-Ford explained', 'YouTube search', 'https://www.youtube.com/results?search_query=bellman+ford+algorithm+explained'),
    ('kruskal-union-find', 0, 'Kruskal''s algorithm', 'Wikipedia', 'https://en.wikipedia.org/wiki/Kruskal%27s_algorithm'),
    ('kruskal-union-find', 1, 'Disjoint-set data structure', 'Wikipedia', 'https://en.wikipedia.org/wiki/Disjoint-set_data_structure'),
    ('kruskal-union-find', 2, 'Kruskal''s algorithm and union-find explained', 'YouTube search', 'https://www.youtube.com/results?search_query=kruskal+algorithm+union+find'),
    ('dynamic-programming', 0, 'Dynamic programming', 'Wikipedia', 'https://en.wikipedia.org/wiki/Dynamic_programming'),
    ('dynamic-programming', 1, 'Dynamic programming explained', 'YouTube search', 'https://www.youtube.com/results?search_query=dynamic+programming+explained'),
    ('dynamic-programming', 2, 'Mastering Dynamic Programming', 'YouTube · Tech With Nikola', 'https://www.youtube.com/watch?v=Hdr64lKQ3e4'),
    ('knapsack-2d-dp', 0, '0-1 Knapsack Problem (Dynamic Programming)', 'YouTube · CS Dojo', 'https://www.youtube.com/watch?v=xOlhR_2QCXY'),
    ('knapsack-2d-dp', 1, 'Knapsack problem', 'Wikipedia', 'https://en.wikipedia.org/wiki/Knapsack_problem'),
    ('knapsack-2d-dp', 2, '0/1 knapsack explained', 'YouTube search', 'https://www.youtube.com/results?search_query=0+1+knapsack+dynamic+programming'),
    ('lcs-edit-distance', 0, 'Longest Common Subsequence - Leetcode 1143', 'YouTube · NeetCode', 'https://www.youtube.com/watch?v=Ua0GhsJSlWM'),
    ('lcs-edit-distance', 1, 'Longest common subsequence', 'Wikipedia', 'https://en.wikipedia.org/wiki/Longest_common_subsequence'),
    ('lcs-edit-distance', 2, 'Edit distance', 'Wikipedia', 'https://en.wikipedia.org/wiki/Edit_distance'),
    ('lcs-edit-distance', 3, 'LCS and edit distance explained', 'YouTube search', 'https://www.youtube.com/results?search_query=longest+common+subsequence+edit+distance'),
    ('greedy-algorithms', 0, 'Greedy Algorithms Tutorial', 'YouTube · freeCodeCamp.org', 'https://www.youtube.com/watch?v=bC7o8P_Ste4'),
    ('greedy-algorithms', 1, 'Greedy algorithm', 'Wikipedia', 'https://en.wikipedia.org/wiki/Greedy_algorithm'),
    ('greedy-algorithms', 2, 'Interval scheduling', 'Wikipedia', 'https://en.wikipedia.org/wiki/Interval_scheduling'),
    ('greedy-algorithms', 3, 'Greedy algorithms explained', 'YouTube search', 'https://www.youtube.com/results?search_query=greedy+algorithms+explained'),
    ('backtracking', 0, 'Backtracking', 'Wikipedia', 'https://en.wikipedia.org/wiki/Backtracking'),
    ('backtracking', 1, 'Backtracking explained', 'YouTube search', 'https://www.youtube.com/results?search_query=backtracking+algorithm+explained')
) AS v (slug, position, title, source, url)
JOIN topics t ON t.slug = v.slug;

-- Practice problems. Solved marks and notes point at these rows, so they are
-- updated in place (matched by slug) instead of being rebuilt.
INSERT INTO practice_problems (topic_id, slug, title, platform, difficulty, url, position)
SELECT t.id, v.slug, v.title, v.platform, v.difficulty, v.url, v.position
FROM (VALUES
    ('arrays', 'two-sum', 'Two Sum', 'LeetCode', 'Easy', 'https://leetcode.com/problems/two-sum/', 0),
    ('arrays', 'best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'LeetCode', 'Easy', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 1),
    ('arrays', 'maximum-subarray', 'Maximum Subarray', 'LeetCode', 'Medium', 'https://leetcode.com/problems/maximum-subarray/', 2),
    ('strings', 'valid-palindrome', 'Valid Palindrome', 'LeetCode', 'Easy', 'https://leetcode.com/problems/valid-palindrome/', 0),
    ('strings', 'valid-anagram', 'Valid Anagram', 'LeetCode', 'Easy', 'https://leetcode.com/problems/valid-anagram/', 1),
    ('strings', 'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'LeetCode', 'Medium', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 2),
    ('binary-search-two-pointers', 'binary-search', 'Binary Search', 'LeetCode', 'Easy', 'https://leetcode.com/problems/binary-search/', 0),
    ('binary-search-two-pointers', 'two-sum-ii-input-array-is-sorted', 'Two Sum II - Input Array Is Sorted', 'LeetCode', 'Medium', 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', 1),
    ('binary-search-two-pointers', 'search-in-rotated-sorted-array', 'Search in Rotated Sorted Array', 'LeetCode', 'Medium', 'https://leetcode.com/problems/search-in-rotated-sorted-array/', 2),
    ('sliding-window', 'maximum-average-subarray-i', 'Maximum Average Subarray I', 'LeetCode', 'Easy', 'https://leetcode.com/problems/maximum-average-subarray-i/', 0),
    ('sliding-window', 'minimum-size-subarray-sum', 'Minimum Size Subarray Sum', 'LeetCode', 'Medium', 'https://leetcode.com/problems/minimum-size-subarray-sum/', 1),
    ('sliding-window', 'longest-repeating-character-replacement', 'Longest Repeating Character Replacement', 'LeetCode', 'Medium', 'https://leetcode.com/problems/longest-repeating-character-replacement/', 2),
    ('linked-lists', 'reverse-linked-list', 'Reverse Linked List', 'LeetCode', 'Easy', 'https://leetcode.com/problems/reverse-linked-list/', 0),
    ('linked-lists', 'merge-two-sorted-lists', 'Merge Two Sorted Lists', 'LeetCode', 'Easy', 'https://leetcode.com/problems/merge-two-sorted-lists/', 1),
    ('linked-lists', 'linked-list-cycle', 'Linked List Cycle', 'LeetCode', 'Easy', 'https://leetcode.com/problems/linked-list-cycle/', 2),
    ('stacks-queues', 'valid-parentheses', 'Valid Parentheses', 'LeetCode', 'Easy', 'https://leetcode.com/problems/valid-parentheses/', 0),
    ('stacks-queues', 'implement-queue-using-stacks', 'Implement Queue using Stacks', 'LeetCode', 'Easy', 'https://leetcode.com/problems/implement-queue-using-stacks/', 1),
    ('stacks-queues', 'min-stack', 'Min Stack', 'LeetCode', 'Medium', 'https://leetcode.com/problems/min-stack/', 2),
    ('hashing', 'contains-duplicate', 'Contains Duplicate', 'LeetCode', 'Easy', 'https://leetcode.com/problems/contains-duplicate/', 0),
    ('hashing', 'group-anagrams', 'Group Anagrams', 'LeetCode', 'Medium', 'https://leetcode.com/problems/group-anagrams/', 1),
    ('hashing', 'longest-consecutive-sequence', 'Longest Consecutive Sequence', 'LeetCode', 'Medium', 'https://leetcode.com/problems/longest-consecutive-sequence/', 2),
    ('bubble-sort', 'sort-an-array', 'Sort an Array', 'LeetCode', 'Medium', 'https://leetcode.com/problems/sort-an-array/', 0),
    ('insertion-sort', 'height-checker', 'Height Checker', 'LeetCode', 'Easy', 'https://leetcode.com/problems/height-checker/', 0),
    ('insertion-sort', 'insertion-sort-list', 'Insertion Sort List', 'LeetCode', 'Medium', 'https://leetcode.com/problems/insertion-sort-list/', 1),
    ('merge-sort', 'merge-sorted-array', 'Merge Sorted Array', 'LeetCode', 'Easy', 'https://leetcode.com/problems/merge-sorted-array/', 0),
    ('merge-sort', 'sort-list', 'Sort List', 'LeetCode', 'Medium', 'https://leetcode.com/problems/sort-list/', 1),
    ('merge-sort', 'merge-k-sorted-lists', 'Merge k Sorted Lists', 'LeetCode', 'Hard', 'https://leetcode.com/problems/merge-k-sorted-lists/', 2),
    ('quick-sort', 'sort-colors', 'Sort Colors', 'LeetCode', 'Medium', 'https://leetcode.com/problems/sort-colors/', 0),
    ('quick-sort', 'kth-largest-element-in-an-array', 'Kth Largest Element in an Array', 'LeetCode', 'Medium', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', 1),
    ('trees', 'maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'LeetCode', 'Easy', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', 0),
    ('trees', 'invert-binary-tree', 'Invert Binary Tree', 'LeetCode', 'Easy', 'https://leetcode.com/problems/invert-binary-tree/', 1),
    ('trees', 'binary-tree-level-order-traversal', 'Binary Tree Level Order Traversal', 'LeetCode', 'Medium', 'https://leetcode.com/problems/binary-tree-level-order-traversal/', 2),
    ('heaps-priority-queues', 'last-stone-weight', 'Last Stone Weight', 'LeetCode', 'Easy', 'https://leetcode.com/problems/last-stone-weight/', 0),
    ('heaps-priority-queues', 'kth-largest-element-in-a-stream', 'Kth Largest Element in a Stream', 'LeetCode', 'Easy', 'https://leetcode.com/problems/kth-largest-element-in-a-stream/', 1),
    ('heaps-priority-queues', 'top-k-frequent-elements', 'Top K Frequent Elements', 'LeetCode', 'Medium', 'https://leetcode.com/problems/top-k-frequent-elements/', 2),
    ('trie', 'implement-trie-prefix-tree', 'Implement Trie (Prefix Tree)', 'LeetCode', 'Medium', 'https://leetcode.com/problems/implement-trie-prefix-tree/', 0),
    ('trie', 'design-add-and-search-words-data-structure', 'Design Add and Search Words Data Structure', 'LeetCode', 'Medium', 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', 1),
    ('trie', 'word-search-ii', 'Word Search II', 'LeetCode', 'Hard', 'https://leetcode.com/problems/word-search-ii/', 2),
    ('graphs', 'number-of-islands', 'Number of Islands', 'LeetCode', 'Medium', 'https://leetcode.com/problems/number-of-islands/', 0),
    ('graphs', 'clone-graph', 'Clone Graph', 'LeetCode', 'Medium', 'https://leetcode.com/problems/clone-graph/', 1),
    ('graphs', 'course-schedule', 'Course Schedule', 'LeetCode', 'Medium', 'https://leetcode.com/problems/course-schedule/', 2),
    ('topological-sort', 'course-schedule-ii', 'Course Schedule II', 'LeetCode', 'Medium', 'https://leetcode.com/problems/course-schedule-ii/', 0),
    ('topological-sort', 'find-all-possible-recipes-from-given-supplies', 'Find All Possible Recipes from Given Supplies', 'LeetCode', 'Medium', 'https://leetcode.com/problems/find-all-possible-recipes-from-given-supplies/', 1),
    ('dijkstra', 'network-delay-time', 'Network Delay Time', 'LeetCode', 'Medium', 'https://leetcode.com/problems/network-delay-time/', 0),
    ('dijkstra', 'path-with-minimum-effort', 'Path With Minimum Effort', 'LeetCode', 'Medium', 'https://leetcode.com/problems/path-with-minimum-effort/', 1),
    ('dijkstra', 'path-with-maximum-probability', 'Path with Maximum Probability', 'LeetCode', 'Medium', 'https://leetcode.com/problems/path-with-maximum-probability/', 2),
    ('bellman-ford-floyd-warshall', 'cheapest-flights-within-k-stops', 'Cheapest Flights Within K Stops', 'LeetCode', 'Medium', 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', 0),
    ('bellman-ford-floyd-warshall', 'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance', 'Find the City With the Smallest Number of Neighbors at a Threshold Distance', 'LeetCode', 'Medium', 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/', 1),
    ('kruskal-union-find', 'number-of-provinces', 'Number of Provinces', 'LeetCode', 'Medium', 'https://leetcode.com/problems/number-of-provinces/', 0),
    ('kruskal-union-find', 'redundant-connection', 'Redundant Connection', 'LeetCode', 'Medium', 'https://leetcode.com/problems/redundant-connection/', 1),
    ('kruskal-union-find', 'min-cost-to-connect-all-points', 'Min Cost to Connect All Points', 'LeetCode', 'Medium', 'https://leetcode.com/problems/min-cost-to-connect-all-points/', 2),
    ('dynamic-programming', 'climbing-stairs', 'Climbing Stairs', 'LeetCode', 'Easy', 'https://leetcode.com/problems/climbing-stairs/', 0),
    ('dynamic-programming', 'house-robber', 'House Robber', 'LeetCode', 'Medium', 'https://leetcode.com/problems/house-robber/', 1),
    ('dynamic-programming', 'coin-change', 'Coin Change', 'LeetCode', 'Medium', 'https://leetcode.com/problems/coin-change/', 2),
    ('knapsack-2d-dp', 'unique-paths', 'Unique Paths', 'LeetCode', 'Medium', 'https://leetcode.com/problems/unique-paths/', 0),
    ('knapsack-2d-dp', 'partition-equal-subset-sum', 'Partition Equal Subset Sum', 'LeetCode', 'Medium', 'https://leetcode.com/problems/partition-equal-subset-sum/', 1),
    ('knapsack-2d-dp', 'target-sum', 'Target Sum', 'LeetCode', 'Medium', 'https://leetcode.com/problems/target-sum/', 2),
    ('lcs-edit-distance', 'longest-common-subsequence', 'Longest Common Subsequence', 'LeetCode', 'Medium', 'https://leetcode.com/problems/longest-common-subsequence/', 0),
    ('lcs-edit-distance', 'delete-operation-for-two-strings', 'Delete Operation for Two Strings', 'LeetCode', 'Medium', 'https://leetcode.com/problems/delete-operation-for-two-strings/', 1),
    ('lcs-edit-distance', 'edit-distance', 'Edit Distance', 'LeetCode', 'Medium', 'https://leetcode.com/problems/edit-distance/', 2),
    ('greedy-algorithms', 'assign-cookies', 'Assign Cookies', 'LeetCode', 'Easy', 'https://leetcode.com/problems/assign-cookies/', 0),
    ('greedy-algorithms', 'jump-game', 'Jump Game', 'LeetCode', 'Medium', 'https://leetcode.com/problems/jump-game/', 1),
    ('greedy-algorithms', 'non-overlapping-intervals', 'Non-overlapping Intervals', 'LeetCode', 'Medium', 'https://leetcode.com/problems/non-overlapping-intervals/', 2),
    ('backtracking', 'subsets', 'Subsets', 'LeetCode', 'Medium', 'https://leetcode.com/problems/subsets/', 0),
    ('backtracking', 'permutations', 'Permutations', 'LeetCode', 'Medium', 'https://leetcode.com/problems/permutations/', 1),
    ('backtracking', 'n-queens', 'N-Queens', 'LeetCode', 'Hard', 'https://leetcode.com/problems/n-queens/', 2)
) AS v (topic_slug, slug, title, platform, difficulty, url, position)
JOIN topics t ON t.slug = v.topic_slug
ON CONFLICT (slug) DO UPDATE SET
    topic_id = EXCLUDED.topic_id,
    title = EXCLUDED.title,
    platform = EXCLUDED.platform,
    difficulty = EXCLUDED.difficulty,
    url = EXCLUDED.url,
    position = EXCLUDED.position;

DELETE FROM practice_problems WHERE slug NOT IN ('two-sum', 'best-time-to-buy-and-sell-stock', 'maximum-subarray', 'valid-palindrome', 'valid-anagram', 'longest-substring-without-repeating-characters', 'binary-search', 'two-sum-ii-input-array-is-sorted', 'search-in-rotated-sorted-array', 'maximum-average-subarray-i', 'minimum-size-subarray-sum', 'longest-repeating-character-replacement', 'reverse-linked-list', 'merge-two-sorted-lists', 'linked-list-cycle', 'valid-parentheses', 'implement-queue-using-stacks', 'min-stack', 'contains-duplicate', 'group-anagrams', 'longest-consecutive-sequence', 'sort-an-array', 'height-checker', 'insertion-sort-list', 'merge-sorted-array', 'sort-list', 'merge-k-sorted-lists', 'sort-colors', 'kth-largest-element-in-an-array', 'maximum-depth-of-binary-tree', 'invert-binary-tree', 'binary-tree-level-order-traversal', 'last-stone-weight', 'kth-largest-element-in-a-stream', 'top-k-frequent-elements', 'implement-trie-prefix-tree', 'design-add-and-search-words-data-structure', 'word-search-ii', 'number-of-islands', 'clone-graph', 'course-schedule', 'course-schedule-ii', 'find-all-possible-recipes-from-given-supplies', 'network-delay-time', 'path-with-minimum-effort', 'path-with-maximum-probability', 'cheapest-flights-within-k-stops', 'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance', 'number-of-provinces', 'redundant-connection', 'min-cost-to-connect-all-points', 'climbing-stairs', 'house-robber', 'coin-change', 'unique-paths', 'partition-equal-subset-sum', 'target-sum', 'longest-common-subsequence', 'delete-operation-for-two-strings', 'edit-distance', 'assign-cookies', 'jump-game', 'non-overlapping-intervals', 'subsets', 'permutations', 'n-queens');
