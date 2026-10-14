-- ============================================================================
-- The algorithm library, from the "algorithms" table in the team's database
-- dump (codepath_backup.sql). A Flyway repeatable migration: it runs after
-- R__seed_catalog.sql (Flyway orders repeatables by name) and again whenever
-- this file changes.
--
-- Differences from the dump:
--   * topic_id links each algorithm to its topic (by topic slug below).
--   * display_order is renumbered to follow the topic order (the dump repeated numbers).
--   * merge-sort and dijkstra-algorithm: the C++ code was a fragment (no merge()
--     function / no main()), so it couldn't print its output. It is completed here;
--     every program in this file was compiled with g++ and prints exactly its "output".
--   * leetcode_difficulty is filled in where the dump left it empty (from LeetCode).
--   * "Not applicable" recurrences are NULL; URLs are trimmed.
-- ============================================================================

INSERT INTO algorithms (name, slug, display_order, description, working, example, cpp_code, output, recurrence, best_complexity, average_complexity, worst_complexity, space_complexity, applications, advantages, disadvantages, youtube_url, leetcode_title, leetcode_url, leetcode_difficulty, topic_id)
SELECT v.name, v.slug, v.display_order, v.description, v.working, v.example, v.cpp_code, v.output, v.recurrence, v.best_complexity, v.average_complexity, v.worst_complexity, v.space_complexity, v.applications, v.advantages, v.disadvantages, v.youtube_url, v.leetcode_title, v.leetcode_url, v.leetcode_difficulty, t.id
FROM (VALUES
    ('Naive Pattern Searching', 'naive-pattern-searching', 'strings', 1, 'The Naive Pattern Searching Algorithm is a simple string matching technique used to find all occurrences of a pattern inside a text. It checks the pattern at every possible position in the text and compares characters one by one.', '1. Let the text length be N and pattern length be M.
2. Start from the first possible position in the text.
3. Compare the pattern with the substring starting at the current position.
4. Compare characters one by one from left to right.
5. If all M characters match, report the current index.
6. If a mismatch occurs, shift the pattern by one position.
7. Repeat until all positions from 0 to N - M are checked.
8. Every successful complete match gives an occurrence of the pattern.', 'Consider the text AABAACAADAABAABA and pattern AABA. The algorithm checks the pattern at every possible starting position. The pattern is found at indices 0, 9 and 12.', '#include <iostream>
#include <string>
using namespace std;

void naivePatternSearch(string text, string pattern)
{
    int n = text.length();
    int m = pattern.length();

    for (int i = 0; i <= n - m; i++)
    {
        int j;

        for (j = 0; j < m; j++)
        {
            if (text[i + j] != pattern[j])
            {
                break;
            }
        }

        if (j == m)
        {
            cout << "Pattern found at index "
                 << i << endl;
        }
    }
}

int main()
{
    string text = "AABAACAADAABAABA";
    string pattern = "AABA";

    naivePatternSearch(text, pattern);

    return 0;
}', 'Pattern found at index 0
Pattern found at index 9
Pattern found at index 12', NULL, 'O(N)', 'O(N * M)', 'O(N * M)', 'O(1)', 'Text searching, simple pattern matching, educational demonstrations, small string processing tasks and situations where preprocessing is unnecessary.', 'It is very easy to understand and implement. It requires no preprocessing of the text or pattern and uses constant extra space.', 'Its worst-case time complexity is O(N * M), making it inefficient for large texts and repetitive patterns compared with algorithms such as KMP or Rabin-Karp.', NULL, 'Find the Index of the First Occurrence in a String', 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/', 'Easy'),
    ('Rabin-Karp Algorithm', 'rabin-karp-algorithm', 'strings', 2, 'The Rabin-Karp Algorithm is a string matching algorithm that uses hashing to find occurrences of a pattern inside a text. Instead of comparing every character at every position, it compares the hash value of the pattern with the hash value of each text window of the same length.', '1. Calculate the hash value of the pattern.
2. Calculate the hash value of the first text window having the same length as the pattern.
3. Compare the pattern hash with the current text window hash.
4. If the hash values match, compare the characters to confirm the match.
5. Move the window one position forward.
6. Calculate the new hash efficiently using a rolling hash instead of recomputing it completely.
7. Repeat until all possible text windows are checked.
8. Report every position where the pattern matches the text.', 'Consider the text GEEKS FOR GEEKS and the pattern GEEK. The algorithm calculates the hash of the pattern and compares it with rolling hash values of text windows. The pattern is found at indices 0 and 10.', '#include <iostream>
#include <string>
using namespace std;

void rabinKarp(string text, string pattern)
{
    int d = 256;
    int q = 101;

    int n = text.length();
    int m = pattern.length();

    int patternHash = 0;
    int textHash = 0;
    int h = 1;

    for (int i = 0; i < m - 1; i++)
    {
        h = (h * d) % q;
    }

    for (int i = 0; i < m; i++)
    {
        patternHash =
            (d * patternHash + pattern[i]) % q;

        textHash =
            (d * textHash + text[i]) % q;
    }

    for (int i = 0; i <= n - m; i++)
    {
        if (patternHash == textHash)
        {
            int j;

            for (j = 0; j < m; j++)
            {
                if (text[i + j] != pattern[j])
                {
                    break;
                }
            }

            if (j == m)
            {
                cout << "Pattern found at index "
                     << i << endl;
            }
        }

        if (i < n - m)
        {
            textHash =
                (d * (textHash - text[i] * h)
                + text[i + m]) % q;

            if (textHash < 0)
            {
                textHash += q;
            }
        }
    }
}

int main()
{
    string text = "GEEKS FOR GEEKS";
    string pattern = "GEEK";

    rabinKarp(text, pattern);

    return 0;
}', 'Pattern found at index 0
Pattern found at index 10', 'newHash = (d * (oldHash - outgoingCharacter * h) + incomingCharacter) mod q', 'O(N + M)', 'O(N + M)', 'O(N * M)', 'O(1)', 'String searching, plagiarism detection, document matching, searching multiple patterns, bioinformatics and detecting repeated substrings.', 'It uses rolling hash to efficiently update the hash of each text window. Its average performance is efficient and it is especially useful when searching for multiple patterns.', 'Hash collisions can cause unnecessary character comparisons. In the worst case, many collisions can make the running time O(N * M). Its performance also depends on the choice of hash function and modulus.', NULL, 'Repeated DNA Sequences', 'https://leetcode.com/problems/repeated-dna-sequences/', 'Medium'),
    ('Selection Sort', 'selection-sort', 'bubble-sort', 3, 'Selection Sort is a comparison-based sorting algorithm that repeatedly finds the smallest element from the unsorted portion of the array and places it at the beginning. The sorted portion grows from left to right until the entire array is sorted.', '1. Start from the first element of the array.
2. Assume the current element is the minimum.
3. Search the remaining unsorted portion for a smaller element.
4. If a smaller element is found, update the minimum index.
5. After scanning the unsorted portion, swap the minimum element with the current element.
6. Move to the next position.
7. Repeat until all elements are sorted.', 'Consider the array {64, 25, 12, 22, 11}. In the first pass, the minimum element 11 is selected and swapped with 64. The process continues for the remaining unsorted portion until the array becomes {11, 12, 22, 25, 64}.', '#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int>& arr)
{
    int n = arr.size();

    for (int i = 0; i < n - 1; i++)
    {
        int minIndex = i;

        for (int j = i + 1; j < n; j++)
        {
            if (arr[j] < arr[minIndex])
            {
                minIndex = j;
            }
        }

        if (minIndex != i)
        {
            swap(arr[i], arr[minIndex]);
        }
    }
}

int main()
{
    vector<int> arr = {64, 25, 12, 22, 11};

    selectionSort(arr);

    cout << "Sorted array: ";

    for (int value : arr)
    {
        cout << value << " ";
    }

    cout << endl;

    return 0;
}', 'Sorted array: 11 12 22 25 64', NULL, 'O(N^2)', 'O(N^2)', 'O(N^2)', 'O(1)', 'Small datasets, educational demonstrations, memory-constrained systems and situations where minimizing the number of swaps is useful.', 'It is simple to understand and implement. It uses constant extra space and performs at most N - 1 swaps, which can be useful when swap operations are expensive.', 'Its time complexity is O(N^2) even when the array is already sorted. It is inefficient for large datasets and is generally not stable in its standard form.', NULL, 'Sort an Array', 'https://leetcode.com/problems/sort-an-array/', 'Medium'),
    ('Merge Sort', 'merge-sort', 'merge-sort', 4, 'Merge Sort is a sorting algorithm based on the Divide and Conquer approach. It divides an array into smaller subarrays, sorts those subarrays, and then merges them together to produce the final sorted array.', 'Merge Sort works in three main steps: Divide the array into two halves, recursively sort both halves, and merge the sorted halves to form the final sorted array.', 'Initial Array: [38, 27, 43, 3, 9, 82, 10]

Divide:
[38, 27, 43, 3] and [9, 82, 10]

Divide again:
[38, 27] [43, 3] [9, 82] [10]

Final Sorted Array:
[3, 9, 10, 27, 38, 43, 82]', '#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> merged;
    int i = left, j = mid + 1;

    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) merged.push_back(arr[i++]);
        else merged.push_back(arr[j++]);
    }
    while (i <= mid) merged.push_back(arr[i++]);
    while (j <= right) merged.push_back(arr[j++]);

    for (int k = 0; k < (int)merged.size(); k++)
        arr[left + k] = merged[k];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left >= right) return;

    int mid = left + (right - left) / 2;

    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);

    merge(arr, left, mid, right);
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};

    mergeSort(arr, 0, arr.size() - 1);

    for (int value : arr)
        cout << value << " ";
    cout << endl;

    return 0;
}', '3 9 10 27 38 43 82', 'T(n) = 2T(n/2) + O(n)', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'Sorting large datasets, external sorting, linked list sorting, inversion counting, and parallel sorting.', 'Stable sorting algorithm, guaranteed O(n log n) performance, suitable for large datasets and linked lists.', 'Requires O(n) extra memory and is not an in-place sorting algorithm.', 'https://www.youtube.com/watch?v=4VqmGXwpLqc', 'Sort an Array', 'https://leetcode.com/problems/sort-an-array/', 'Medium'),
    ('Quick Sort', 'quick-sort', 'quick-sort', 5, 'Quick Sort is a divide-and-conquer sorting algorithm that selects a pivot element and partitions the array so that elements smaller than the pivot are placed before it and elements greater than the pivot are placed after it. The same process is then applied recursively to the left and right subarrays.', '1. Select a pivot element from the array.
2. Partition the array around the pivot.
3. Move elements smaller than or equal to the pivot to its left side.
4. Move larger elements to its right side.
5. Place the pivot in its correct sorted position.
6. Recursively apply Quick Sort to the left subarray.
7. Recursively apply Quick Sort to the right subarray.
8. Stop when a subarray contains zero or one element.', 'Consider the array {10, 7, 8, 9, 1, 5}. If 5 is selected as the pivot, partitioning places 1 before the pivot and larger elements after it. Recursive partitioning of the remaining subarrays eventually produces {1, 5, 7, 8, 9, 10}.', '#include <iostream>
#include <vector>
using namespace std;

int partitionArray(vector<int>& arr, int low, int high)
{
    int pivot = arr[high];
    int i = low - 1;

    for (int j = low; j < high; j++)
    {
        if (arr[j] <= pivot)
        {
            i++;
            swap(arr[i], arr[j]);
        }
    }

    swap(arr[i + 1], arr[high]);

    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high)
{
    if (low < high)
    {
        int pivotIndex = partitionArray(arr, low, high);

        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

int main()
{
    vector<int> arr = {10, 7, 8, 9, 1, 5};

    quickSort(arr, 0, arr.size() - 1);

    cout << "Sorted array: ";

    for (int value : arr)
    {
        cout << value << " ";
    }

    cout << endl;

    return 0;
}', 'Sorted array: 1 5 7 8 9 10', 'T(N) = T(K) + T(N-K-1) + O(N); balanced partitions give T(N) = 2T(N/2) + O(N).', 'O(N log N)', 'O(N log N)', 'O(N^2)', 'O(log N)', 'General-purpose sorting, arrays, internal memory sorting, database systems, numerical applications and situations requiring fast in-place sorting.', 'It has excellent average-case performance, usually requires little extra memory and is often faster in practice than many other comparison-based sorting algorithms.', 'Its worst-case time complexity is O(N^2) when poor pivots are repeatedly selected. It is not stable in its standard form and recursive calls may consume additional stack space.', NULL, 'Kth Largest Element in an Array', 'https://leetcode.com/problems/kth-largest-element-in-an-array/', 'Medium'),
    ('Dijkstra Algorithm', 'dijkstra-algorithm', 'dijkstra', 6, 'Dijkstra Algorithm is a greedy graph algorithm used to find the shortest path from a source vertex to all other vertices in a weighted graph with non-negative edge weights.', 'Start from the source vertex with distance 0. Assign infinity to all other vertices. Repeatedly choose the unvisited vertex with the smallest known distance. For each adjacent vertex, check whether going through the current vertex gives a shorter path. If yes, update the distance. Continue until all reachable vertices are processed.', 'Example graph:

0 -> 1 (4)
0 -> 2 (1)
2 -> 1 (2)
1 -> 3 (1)
2 -> 3 (5)

Source = 0

Shortest distances:
0 = 0
1 = 3
2 = 1
3 = 4', '#include <iostream>
#include <vector>
#include <queue>
using namespace std;

void dijkstra(int src, vector<vector<pair<int,int>>> &adj)
{
    int n = adj.size();

    vector<int> dist(n, 1e9);

    priority_queue<
        pair<int,int>,
        vector<pair<int,int>>,
        greater<pair<int,int>>
    > pq;

    dist[src] = 0;
    pq.push({0, src});

    while(!pq.empty())
    {
        int distance = pq.top().first;
        int node = pq.top().second;

        pq.pop();

        if(distance > dist[node])
            continue;

        for(auto edge : adj[node])
        {
            int nextNode = edge.first;
            int weight = edge.second;

            if(dist[node] + weight < dist[nextNode])
            {
                dist[nextNode] = dist[node] + weight;
                pq.push({dist[nextNode], nextNode});
            }
        }
    }

    for(int i = 0; i < n; i++)
        cout << i << " -> " << dist[i] << endl;
}

int main()
{
    // The example graph: 0 -> 1 (4), 0 -> 2 (1), 2 -> 1 (2), 1 -> 3 (1), 2 -> 3 (5)
    vector<vector<pair<int,int>>> adj(4);

    adj[0].push_back({1, 4});
    adj[0].push_back({2, 1});
    adj[2].push_back({1, 2});
    adj[1].push_back({3, 1});
    adj[2].push_back({3, 5});

    dijkstra(0, adj);

    return 0;
}', '0 -> 0
1 -> 3
2 -> 1
3 -> 4', NULL, 'O((V + E) log V)', 'O((V + E) log V)', 'O((V + E) log V)', 'O(V + E)', 'GPS navigation, network routing, shortest path problems, map applications and transportation systems.', 'Efficient for sparse graphs, guarantees shortest paths for non-negative edge weights and works well with priority queues.', 'Does not work correctly with negative edge weights and requires extra memory for the graph and priority queue.', 'https://www.youtube.com/watch?v=smHnz2RHJBY', 'Network Delay Time', 'https://leetcode.com/problems/network-delay-time/', 'Medium'),
    ('Bellman-Ford Algorithm', 'bellman-ford-algorithm', 'bellman-ford-floyd-warshall', 7, 'The Bellman-Ford Algorithm is a shortest path algorithm used to find the minimum distance from a single source vertex to all other vertices in a weighted graph. Unlike Dijkstra''s Algorithm, Bellman-Ford can handle graphs containing negative edge weights and can also detect negative weight cycles.', '1. Initialize the distance of the source vertex as 0 and all other vertices as infinity.
2. Repeat the relaxation process V - 1 times.
3. During each iteration, examine every edge in the graph.
4. For an edge from u to v with weight w, update distance[v] if distance[u] + w is smaller.
5. After V - 1 iterations, all shortest distances are obtained if no negative cycle exists.
6. Perform one additional pass through all edges.
7. If any distance can still be reduced, the graph contains a negative weight cycle.', 'Consider a graph with five vertices and weighted directed edges. Starting from source vertex 0, Bellman-Ford repeatedly relaxes every edge. After V - 1 iterations, the shortest distances from the source to all reachable vertices are obtained. A final relaxation pass is used to check for a negative weight cycle.', '#include <iostream>
#include <vector>
#include <climits>
using namespace std;

struct Edge
{
    int source;
    int destination;
    int weight;
};

void bellmanFord(vector<Edge>& edges, int V, int source)
{
    vector<int> distance(V, INT_MAX);
    distance[source] = 0;

    for (int i = 1; i <= V - 1; i++)
    {
        for (Edge edge : edges)
        {
            int u = edge.source;
            int v = edge.destination;
            int w = edge.weight;

            if (distance[u] != INT_MAX &&
                distance[u] + w < distance[v])
            {
                distance[v] = distance[u] + w;
            }
        }
    }

    for (Edge edge : edges)
    {
        int u = edge.source;
        int v = edge.destination;
        int w = edge.weight;

        if (distance[u] != INT_MAX &&
            distance[u] + w < distance[v])
        {
            cout << "Graph contains a negative weight cycle" << endl;
            return;
        }
    }

    cout << "Vertex - Distance from Source" << endl;

    for (int i = 0; i < V; i++)
    {
        cout << i << " - " << distance[i] << endl;
    }
}

int main()
{
    int V = 5;

    vector<Edge> edges = {
        {0, 1, -1},
        {0, 2, 4},
        {1, 2, 3},
        {1, 3, 2},
        {1, 4, 2},
        {3, 2, 5},
        {3, 1, 1},
        {4, 3, -3}
    };

    bellmanFord(edges, V, 0);

    return 0;
}', 'Vertex - Distance from Source
0 - 0
1 - -1
2 - 2
3 - -2
4 - 1', 'dist[v] = min(dist[v], dist[u] + weight(u,v)) for every edge (u,v), repeated V - 1 times', 'O(V * E)', 'O(V * E)', 'O(V * E)', 'O(V)', 'Network routing, shortest path problems with negative edge weights, currency arbitrage detection, graph optimization and detecting negative weight cycles.', 'It supports negative edge weights, can detect negative weight cycles and is simpler to apply than many advanced shortest-path methods.', 'It is slower than Dijkstra''s Algorithm for graphs without negative weights. Its O(V * E) time complexity makes it inefficient for very large graphs.', NULL, 'Cheapest Flights Within K Stops', 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', 'Medium'),
    ('Floyd-Warshall Algorithm', 'floyd-warshall-algorithm', 'bellman-ford-floyd-warshall', 8, 'The Floyd-Warshall Algorithm is a dynamic programming algorithm used to find the shortest distances between every pair of vertices in a weighted graph. It can handle both positive and negative edge weights, but the graph must not contain negative weight cycles.', '1. Create a distance matrix representing distances between every pair of vertices.
2. Set the distance from each vertex to itself as 0.
3. Set unreachable pairs to infinity.
4. Consider each vertex k as an intermediate vertex.
5. For every pair of vertices i and j, check whether travelling through k gives a shorter path.
6. Update dist[i][j] if dist[i][k] + dist[k][j] is smaller.
7. Repeat until every vertex has been considered as an intermediate vertex.
8. The final matrix contains the shortest distances between all pairs of vertices.', 'Consider a graph with five vertices. Initially, the distance matrix contains direct edge weights and infinity where no direct edge exists. Floyd-Warshall repeatedly checks whether passing through an intermediate vertex produces a shorter route. After all vertices are processed, every matrix cell contains the shortest distance between its corresponding pair of vertices.', '#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int INF = 100000000;

void floydWarshall(vector<vector<int>>& dist)
{
    int V = dist.size();

    for (int k = 0; k < V; k++)
    {
        for (int i = 0; i < V; i++)
        {
            for (int j = 0; j < V; j++)
            {
                if (dist[i][k] != INF &&
                    dist[k][j] != INF)
                {
                    dist[i][j] = min(
                        dist[i][j],
                        dist[i][k] + dist[k][j]
                    );
                }
            }
        }
    }
}

int main()
{
    vector<vector<int>> dist = {
        {0, 4, INF, 5, INF},
        {INF, 0, 1, INF, 6},
        {2, INF, 0, 3, INF},
        {INF, INF, 1, 0, 2},
        {1, INF, INF, 4, 0}
    };

    floydWarshall(dist);

    cout << "Shortest distance matrix:" << endl;

    for (int i = 0; i < dist.size(); i++)
    {
        for (int j = 0; j < dist.size(); j++)
        {
            cout << dist[i][j] << " ";
        }

        cout << endl;
    }

    return 0;
}', 'Shortest distance matrix:
0 4 5 5 7
3 0 1 4 6
2 6 0 3 5
3 7 1 0 2
1 5 5 4 0', 'dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])', 'O(V^3)', 'O(V^3)', 'O(V^3)', 'O(V^2)', 'Network routing, shortest path analysis, transportation systems, graph connectivity, distance matrices, transitive closure and finding shortest paths between every pair of vertices.', 'It finds shortest paths between all pairs of vertices in a single algorithm. It works with directed and undirected graphs. It can also handle negative edge weights when negative cycles are absent.', 'Its O(V^3) time complexity makes it inefficient for very large or sparse graphs. It requires O(V^2) memory to store the distance matrix. It cannot produce valid shortest paths when the graph contains a negative weight cycle.', NULL, 'Find the City With the Smallest Number of Neighbors at a Threshold Distance', 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/', 'Medium'),
    ('Kruskal Algorithm', 'kruskal-algorithm', 'kruskal-union-find', 9, 'Kruskal Algorithm is a greedy algorithm used to find a Minimum Spanning Tree of a connected, weighted and undirected graph. It repeatedly selects the smallest available edge that does not create a cycle.', 'First sort all edges by increasing weight. Start with an empty spanning tree. Pick the smallest edge. Add it only if it connects two different components and does not create a cycle. Use Disjoint Set Union to check whether two vertices already belong to the same component. Continue until the spanning tree contains V - 1 edges.', 'Example edges:

0 - 1 : 10
0 - 2 : 6
0 - 3 : 5
1 - 3 : 15
2 - 3 : 4

Sorted edges:
2 - 3 : 4
0 - 3 : 5
0 - 2 : 6
0 - 1 : 10
1 - 3 : 15

Selected edges:
2 - 3 : 4
0 - 3 : 5
0 - 1 : 10

Minimum Spanning Tree weight = 19', '#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class DSU
{
    vector<int> parent, rank;

public:
    DSU(int n)
    {
        parent.resize(n);
        rank.resize(n, 0);

        for(int i = 0; i < n; i++)
            parent[i] = i;
    }

    int find(int x)
    {
        if(parent[x] != x)
            parent[x] = find(parent[x]);

        return parent[x];
    }

    bool unite(int a, int b)
    {
        a = find(a);
        b = find(b);

        if(a == b)
            return false;

        if(rank[a] < rank[b])
            swap(a, b);

        parent[b] = a;

        if(rank[a] == rank[b])
            rank[a]++;

        return true;
    }
};

int main()
{
    int V = 4;

    vector<vector<int>> edges = {
        {10, 0, 1},
        {6, 0, 2},
        {5, 0, 3},
        {15, 1, 3},
        {4, 2, 3}
    };

    sort(edges.begin(), edges.end());

    DSU dsu(V);

    int totalWeight = 0;

    for(auto edge : edges)
    {
        int weight = edge[0];
        int u = edge[1];
        int v = edge[2];

        if(dsu.unite(u, v))
        {
            totalWeight += weight;
            cout << u << " - " << v
                 << " : " << weight << endl;
        }
    }

    cout << "Total Weight = "
         << totalWeight << endl;
}', '2 - 3 : 4
0 - 3 : 5
0 - 1 : 10
Total Weight = 19', NULL, 'O(E log E)', 'O(E log E)', 'O(E log E)', 'O(V)', 'Network design, road and railway planning, electrical wiring, clustering and minimum-cost connectivity problems.', 'Simple greedy approach, efficient for sparse graphs and works well with Disjoint Set Union.', 'Requires sorting all edges and is mainly useful for undirected weighted graphs.', 'https://www.youtube.com/watch?v=EjVHtpWkIho', 'Min Cost to Connect All Points', 'https://leetcode.com/problems/min-cost-to-connect-all-points/', 'Medium'),
    ('Prim''s Algorithm', 'prims-algorithm', 'kruskal-union-find', 10, 'Prim''s Algorithm is a greedy algorithm used to find the Minimum Spanning Tree (MST) of a connected, weighted, undirected graph. A minimum spanning tree connects all vertices with the minimum possible total edge weight without forming any cycles.', '1. Select any vertex as the starting vertex.
2. Mark the starting vertex as visited.
3. Find the minimum-weight edge connecting a visited vertex to an unvisited vertex.
4. Add the selected edge and vertex to the Minimum Spanning Tree.
5. Repeat the process until all vertices are included.
6. The selected edges form the Minimum Spanning Tree.', 'Consider a graph containing five vertices numbered 0 to 4. Starting from vertex 0, Prim''s Algorithm repeatedly chooses the minimum-weight edge that connects the current tree to an unvisited vertex. The process continues until all vertices are connected.', '#include <iostream>
#include <vector>
#include <climits>
using namespace std;

int minKey(vector<int>& key, vector<bool>& mstSet, int V)
{
    int minValue = INT_MAX;
    int minIndex = -1;

    for (int v = 0; v < V; v++)
    {
        if (!mstSet[v] && key[v] < minValue)
        {
            minValue = key[v];
            minIndex = v;
        }
    }

    return minIndex;
}

void primMST(vector<vector<int>>& graph, int V)
{
    vector<int> parent(V);
    vector<int> key(V, INT_MAX);
    vector<bool> mstSet(V, false);

    key[0] = 0;
    parent[0] = -1;

    for (int count = 0; count < V - 1; count++)
    {
        int u = minKey(key, mstSet, V);
        mstSet[u] = true;

        for (int v = 0; v < V; v++)
        {
            if (graph[u][v] != 0 &&
                !mstSet[v] &&
                graph[u][v] < key[v])
            {
                parent[v] = u;
                key[v] = graph[u][v];
            }
        }
    }

    cout << "Edge - Weight" << endl;

    for (int i = 1; i < V; i++)
    {
        cout << parent[i] << " - " << i
             << " : " << graph[i][parent[i]] << endl;
    }
}

int main()
{
    int V = 5;

    vector<vector<int>> graph = {
        {0, 2, 0, 6, 0},
        {2, 0, 3, 8, 5},
        {0, 3, 0, 0, 7},
        {6, 8, 0, 0, 9},
        {0, 5, 7, 9, 0}
    };

    primMST(graph, V);

    return 0;
}', 'Edge - Weight
0 - 1 : 2
1 - 2 : 3
0 - 3 : 6
1 - 4 : 5', NULL, 'O(V^2)', 'O(V^2)', 'O(V^2)', 'O(V)', 'Prim''s Algorithm is used in network design, road construction, electrical grids, communication networks, cable networks and other minimum-cost connectivity problems.', 'It is simple to understand and implement. It always produces a Minimum Spanning Tree for a connected weighted undirected graph. The adjacency matrix implementation works well for dense graphs.', 'It requires a connected graph. The adjacency matrix implementation has O(V^2) time complexity. For sparse graphs, implementations using a priority queue are generally more efficient.', 'https://www.youtube.com/watch?v=_KX8GDvRzBc', 'Min Cost to Connect All Points', 'https://leetcode.com/problems/min-cost-to-connect-all-points/', 'Medium'),
    ('Multistage Graph Shortest Path', 'multistage-graph-shortest-path', 'dynamic-programming', 11, 'A Multistage Graph is a directed weighted graph in which vertices are divided into different stages. Edges connect vertices from one stage to a later stage. The shortest path problem finds the minimum cost path from the source vertex in the first stage to the destination vertex in the final stage using dynamic programming.', '1. Divide the graph vertices into different stages.
2. Start processing from the destination vertex.
3. Set the cost of reaching the destination from itself as 0.
4. Process the remaining vertices in reverse order.
5. For every vertex, examine all outgoing edges.
6. Calculate edge weight plus the minimum cost of the destination vertex of that edge.
7. Store the minimum of these values as the shortest cost from the current vertex.
8. Continue until the source vertex is processed.
9. The cost stored for the source vertex gives the shortest path cost.', 'Consider a multistage graph with vertices numbered from 0 to 7. Vertex 0 is the source and vertex 7 is the destination. By processing vertices backwards and storing the minimum cost from each vertex to the destination, the shortest path from source to destination is obtained.', '#include <iostream>
#include <vector>
#include <climits>
#include <algorithm>
using namespace std;

int shortestPath(vector<vector<int>>& graph)
{
    int V = graph.size();

    vector<int> cost(V, INT_MAX);

    cost[V - 1] = 0;

    for (int i = V - 2; i >= 0; i--)
    {
        for (int j = i + 1; j < V; j++)
        {
            if (graph[i][j] != 0 &&
                cost[j] != INT_MAX)
            {
                cost[i] = min(
                    cost[i],
                    graph[i][j] + cost[j]
                );
            }
        }
    }

    return cost[0];
}

int main()
{
    vector<vector<int>> graph = {
        {0, 1, 2, 5, 0, 0, 0, 0},
        {0, 0, 0, 0, 4, 11, 0, 0},
        {0, 0, 0, 0, 9, 5, 16, 0},
        {0, 0, 0, 0, 0, 0, 2, 0},
        {0, 0, 0, 0, 0, 0, 0, 18},
        {0, 0, 0, 0, 0, 0, 0, 13},
        {0, 0, 0, 0, 0, 0, 0, 2},
        {0, 0, 0, 0, 0, 0, 0, 0}
    };

    cout << "Minimum cost: "
         << shortestPath(graph)
         << endl;

    return 0;
}', 'Minimum cost: 9', 'cost[i] = min(weight(i,j) + cost[j]) for every vertex j reachable from vertex i, with cost[destination] = 0', 'O(V^2)', 'O(V^2)', 'O(V^2)', 'O(V)', 'Route planning, network optimization, resource allocation, scheduling problems, transportation systems and problems where decisions occur through multiple sequential stages.', 'Dynamic programming avoids repeatedly solving the same subproblems. The algorithm is simple when vertices are arranged stage-wise and efficiently finds the minimum cost path in a directed acyclic multistage graph.', 'It is designed specifically for multistage directed acyclic graphs. The vertices must follow a valid stage ordering. It is not suitable for general graphs containing arbitrary cycles.', NULL, 'Longest Increasing Path in a Matrix', 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/', 'Hard'),
    ('Travelling Salesman Problem', 'travelling-salesman-problem', 'dynamic-programming', 12, 'The Travelling Salesman Problem (TSP) is an optimization problem in which a salesman must visit every city exactly once and return to the starting city while minimizing the total travel cost. Using dynamic programming, repeated subproblems are stored and reused to avoid recalculating the same routes.', '1. Choose a starting city.
2. Represent the set of visited cities using a bitmask.
3. Define a DP state using the current city and the set of visited cities.
4. From the current city, try travelling to every unvisited city.
5. Calculate the cost of travelling to that city plus the optimal cost of visiting the remaining cities.
6. Store the minimum result for each state.
7. When all cities have been visited, return to the starting city.
8. The minimum value obtained is the shortest possible tour cost.', 'Consider four cities with the distance matrix {{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}}. Starting from city 0, the minimum tour cost is 80. One optimal route is 0 -> 1 -> 3 -> 2 -> 0.', '#include <iostream>
#include <vector>
#include <climits>
#include <algorithm>
using namespace std;

int n;
vector<vector<int>> dist;
vector<vector<int>> dp;

int tsp(int mask, int pos)
{
    if (mask == (1 << n) - 1)
    {
        return dist[pos][0];
    }

    if (dp[mask][pos] != -1)
    {
        return dp[mask][pos];
    }

    int answer = INT_MAX;

    for (int city = 0; city < n; city++)
    {
        if ((mask & (1 << city)) == 0)
        {
            int newCost =
                dist[pos][city] +
                tsp(mask | (1 << city), city);

            answer = min(answer, newCost);
        }
    }

    return dp[mask][pos] = answer;
}

int main()
{
    dist = {
        {0, 10, 15, 20},
        {10, 0, 35, 25},
        {15, 35, 0, 30},
        {20, 25, 30, 0}
    };

    n = dist.size();

    dp.assign(
        1 << n,
        vector<int>(n, -1)
    );

    cout << "Minimum tour cost: "
         << tsp(1, 0)
         << endl;

    return 0;
}', 'Minimum tour cost: 80', 'TSP(A, R) = C(A, S) if R is empty; otherwise TSP(A, R) = min(C(A, K) + TSP(K, R - {K})) for every unvisited city K.', 'O(n^2 * 2^n)', 'O(n^2 * 2^n)', 'O(n^2 * 2^n)', 'O(n * 2^n)', 'Vehicle routing, delivery planning, logistics, circuit board manufacturing, warehouse optimization, robot path planning and scheduling problems.', 'Dynamic programming avoids recalculating identical subproblems and is significantly faster than checking every possible permutation. It guarantees the optimal tour for the given distance matrix.', 'The algorithm still has exponential complexity and becomes impractical for a large number of cities. It also requires substantial memory because states are stored for combinations of visited cities and current positions.', NULL, 'Shortest Path Visiting All Nodes', 'https://leetcode.com/problems/shortest-path-visiting-all-nodes/', 'Hard'),
    ('0/1 Knapsack', '0-1-knapsack', 'knapsack-2d-dp', 13, 'The 0/1 Knapsack Problem is a dynamic programming problem where we are given multiple items, each having a weight and value, along with a knapsack of limited capacity. Each item can either be completely included or completely excluded. The goal is to maximize the total value without exceeding the knapsack capacity.', '1. Create a DP table where rows represent items and columns represent knapsack capacities.
2. Initialize the first row and first column with 0.
3. For every item, check whether its weight is less than or equal to the current capacity.
4. If it fits, choose the maximum between including the item and excluding the item.
5. If it does not fit, copy the result from the previous row.
6. Continue until all items and capacities are processed.
7. The bottom-right cell contains the maximum possible value.', 'Suppose there are three items with values {60, 100, 120} and weights {10, 20, 30}. The knapsack capacity is 50. The optimal choice is to select the items with weights 20 and 30, producing a maximum total value of 220.', '#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int knapsack(int capacity, vector<int>& weights, vector<int>& values, int n)
{
    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));

    for (int i = 1; i <= n; i++)
    {
        for (int w = 0; w <= capacity; w++)
        {
            if (weights[i - 1] <= w)
            {
                dp[i][w] = max(
                    values[i - 1] + dp[i - 1][w - weights[i - 1]],
                    dp[i - 1][w]
                );
            }
            else
            {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    return dp[n][capacity];
}

int main()
{
    vector<int> values = {60, 100, 120};
    vector<int> weights = {10, 20, 30};

    int capacity = 50;
    int n = values.size();

    cout << "Maximum value: "
         << knapsack(capacity, weights, values, n)
         << endl;

    return 0;
}', 'Maximum value: 220', 'K(i, W) = 0 if i = 0 or W = 0; K(i, W) = K(i-1, W) if weight[i-1] > W; otherwise K(i, W) = max(K(i-1, W), value[i-1] + K(i-1, W-weight[i-1]))', 'O(n * W)', 'O(n * W)', 'O(n * W)', 'O(n * W)', 'Resource allocation, budget optimization, investment selection, cargo loading, project selection, memory management and other problems involving limited resources and maximum benefit.', 'Dynamic programming avoids repeated calculations. It guarantees the optimal solution. It is easier to understand than the exponential recursive approach and works well when the knapsack capacity is reasonably small.', 'Its time and space complexity depend on the knapsack capacity. For very large capacities, the DP table may consume significant memory. It is a pseudo-polynomial algorithm rather than a polynomial-time algorithm based purely on input size.', NULL, 'Partition Equal Subset Sum', 'https://leetcode.com/problems/partition-equal-subset-sum/', 'Medium'),
    ('Subset Sum Problem', 'subset-sum-problem', 'knapsack-2d-dp', 14, 'The Subset Sum Problem is a dynamic programming problem that determines whether there exists a subset of a given set whose elements add up exactly to a specified target sum.', '1. Let n be the number of elements and target be the required sum.
2. Create a DP table where rows represent elements and columns represent possible sums from 0 to target.
3. Initialize the first column as true because a sum of 0 can always be formed using an empty subset.
4. For each element, check whether its value is greater than the current target sum.
5. If it is greater, copy the value from the previous row.
6. Otherwise, either exclude the current element or include it.
7. Mark the current state true if either choice can produce the required sum.
8. After processing all elements, dp[n][target] tells whether the required subset exists.', 'Consider the set {3, 34, 4, 12, 5, 2} and target sum 9. A valid subset is {4, 5}, whose elements add up to 9. Therefore, the answer is true.', '#include <iostream>
#include <vector>
using namespace std;

bool subsetSum(vector<int>& arr, int target)
{
    int n = arr.size();

    vector<vector<bool>> dp(
        n + 1,
        vector<bool>(target + 1, false)
    );

    for (int i = 0; i <= n; i++)
    {
        dp[i][0] = true;
    }

    for (int i = 1; i <= n; i++)
    {
        for (int sum = 1; sum <= target; sum++)
        {
            if (arr[i - 1] > sum)
            {
                dp[i][sum] = dp[i - 1][sum];
            }
            else
            {
                dp[i][sum] =
                    dp[i - 1][sum] ||
                    dp[i - 1][sum - arr[i - 1]];
            }
        }
    }

    return dp[n][target];
}

int main()
{
    vector<int> arr = {3, 34, 4, 12, 5, 2};
    int target = 9;

    if (subsetSum(arr, target))
    {
        cout << "Subset with given sum exists" << endl;
    }
    else
    {
        cout << "Subset with given sum does not exist" << endl;
    }

    return 0;
}', 'Subset with given sum exists', 'dp[i][sum] = dp[i-1][sum] if arr[i-1] > sum; otherwise dp[i][sum] = dp[i-1][sum] OR dp[i-1][sum-arr[i-1]]. Base case: dp[i][0] = true.', 'O(n * target)', 'O(n * target)', 'O(n * target)', 'O(n * target)', 'Resource allocation, partition problems, scheduling, financial planning, cryptography, combinatorial optimization and determining whether a specific total can be formed from available values.', 'Dynamic programming avoids repeated calculations and is much more efficient than the simple recursive approach. It reliably determines whether a subset with the required sum exists.', 'Its time and memory requirements depend on the target sum. For very large target values, the DP table can consume significant memory. The algorithm is pseudo-polynomial rather than polynomial in the binary input size.', NULL, 'Partition Equal Subset Sum', 'https://leetcode.com/problems/partition-equal-subset-sum/', 'Medium'),
    ('Longest Common Subsequence', 'longest-common-subsequence', 'lcs-edit-distance', 15, 'The Longest Common Subsequence (LCS) problem is a dynamic programming problem that finds the longest sequence of characters that appears in the same relative order in two strings. The characters do not need to be consecutive.', '1. Let the lengths of the two strings be m and n.
2. Create a DP table of size (m + 1) x (n + 1).
3. Initialize the first row and first column with 0.
4. Compare characters from both strings.
5. If the characters match, set dp[i][j] = 1 + dp[i-1][j-1].
6. If the characters do not match, set dp[i][j] = max(dp[i-1][j], dp[i][j-1]).
7. Continue until all characters are processed.
8. The value dp[m][n] gives the length of the Longest Common Subsequence.', 'Consider the strings AGGTAB and GXTXAYB. The longest common subsequence is GTAB, which has length 4.', '#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int longestCommonSubsequence(string s1, string s2)
{
    int m = s1.length();
    int n = s2.length();

    vector<vector<int>> dp(
        m + 1,
        vector<int>(n + 1, 0)
    );

    for (int i = 1; i <= m; i++)
    {
        for (int j = 1; j <= n; j++)
        {
            if (s1[i - 1] == s2[j - 1])
            {
                dp[i][j] =
                    1 + dp[i - 1][j - 1];
            }
            else
            {
                dp[i][j] =
                    max(dp[i - 1][j],
                        dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
}

int main()
{
    string s1 = "AGGTAB";
    string s2 = "GXTXAYB";

    cout << "Length of LCS: "
         << longestCommonSubsequence(s1, s2)
         << endl;

    return 0;
}', 'Length of LCS: 4', 'L(i,j) = 1 + L(i-1,j-1) if X[i-1] = Y[j-1]; otherwise L(i,j) = max(L(i-1,j), L(i,j-1)). Base case: L(0,j) = L(i,0) = 0.', 'O(m * n)', 'O(m * n)', 'O(m * n)', 'O(m * n)', 'File comparison, version control systems, DNA sequence analysis, plagiarism detection, text comparison, spell checking and data synchronization.', 'Dynamic programming avoids repeated calculations and guarantees the optimal LCS length. It is useful for comparing sequences and can be extended to reconstruct the actual longest common subsequence.', 'The standard implementation requires O(m * n) memory. For very large strings, the DP table can consume significant space. The basic implementation returns only the length unless additional backtracking is performed.', NULL, 'Longest Common Subsequence', 'https://leetcode.com/problems/longest-common-subsequence/', 'Medium'),
    ('Fractional Knapsack', 'fractional-knapsack', 'greedy-algorithms', 16, 'The Fractional Knapsack Problem is a greedy optimization problem in which items have values and weights, and the knapsack has a limited capacity. Unlike 0/1 Knapsack, fractions of items can be selected. The objective is to maximize the total value placed inside the knapsack.', '1. Calculate the value-to-weight ratio for every item.
2. Sort all items in decreasing order of value-to-weight ratio.
3. Start selecting items from the highest ratio.
4. If an item fits completely, add the whole item.
5. If it does not fit completely, add the fraction that fits.
6. Stop when the knapsack capacity becomes zero.
7. The accumulated value is the maximum possible value.', 'Suppose values are {60, 100, 120}, weights are {10, 20, 30}, and capacity is 50. The value-to-weight ratios are 6, 5 and 4. Take the first two items completely and take 20 units of the third item. The final maximum value is 240.', '#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Item
{
    int value;
    int weight;
};

bool compare(Item a, Item b)
{
    double ratioA = (double)a.value / a.weight;
    double ratioB = (double)b.value / b.weight;

    return ratioA > ratioB;
}

double fractionalKnapsack(vector<Item>& items, int capacity)
{
    sort(items.begin(), items.end(), compare);

    double totalValue = 0.0;

    for (Item item : items)
    {
        if (capacity == 0)
        {
            break;
        }

        if (item.weight <= capacity)
        {
            capacity -= item.weight;
            totalValue += item.value;
        }
        else
        {
            double fraction = (double)capacity / item.weight;
            totalValue += item.value * fraction;
            capacity = 0;
        }
    }

    return totalValue;
}

int main()
{
    vector<Item> items = {
        {60, 10},
        {100, 20},
        {120, 30}
    };

    int capacity = 50;

    cout << "Maximum value: "
         << fractionalKnapsack(items, capacity)
         << endl;

    return 0;
}', 'Maximum value: 240', NULL, 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', 'Cargo loading, resource allocation, budget distribution, investment planning, bandwidth allocation and other optimization problems where resources can be divided.', 'It is simple and efficient. The greedy approach guarantees the optimal solution for Fractional Knapsack. It is faster than the dynamic programming solution used for 0/1 Knapsack.', 'It cannot be used when items are indivisible. The greedy strategy does not work for 0/1 Knapsack. Sorting is required before selecting the items.', 'https://www.youtube.com/watch?v=oTTzNMHM05I', 'Boats to Save People', 'https://leetcode.com/problems/boats-to-save-people/', 'Medium'),
    ('N-Queen Problem', 'n-queen-problem', 'backtracking', 17, 'The N-Queen Problem is a classic backtracking problem in which N queens must be placed on an N x N chessboard so that no two queens attack each other. Therefore, no two queens can be in the same row, column or diagonal.', '1. Start from the first row of the chessboard.
2. Try placing a queen in each column of the current row.
3. Before placing a queen, check whether the position is safe.
4. A position is safe if no previously placed queen exists in the same column or diagonal.
5. If the position is safe, place the queen and recursively move to the next row.
6. If no valid position is available in the current row, backtrack to the previous row.
7. Remove the previously placed queen and try the next available column.
8. Continue until queens are placed in all N rows.
9. If all queens are successfully placed, a valid solution is found.', 'For N = 4, one valid arrangement places queens at positions (0,1), (1,3), (2,0) and (3,2). In this arrangement, no two queens share the same row, column or diagonal.', '#include <iostream>
#include <vector>
using namespace std;

bool isSafe(vector<vector<int>>& board, int row, int col, int n)
{
    for (int i = 0; i < row; i++)
    {
        if (board[i][col] == 1)
        {
            return false;
        }
    }

    for (int i = row - 1, j = col - 1;
         i >= 0 && j >= 0;
         i--, j--)
    {
        if (board[i][j] == 1)
        {
            return false;
        }
    }

    for (int i = row - 1, j = col + 1;
         i >= 0 && j < n;
         i--, j++)
    {
        if (board[i][j] == 1)
        {
            return false;
        }
    }

    return true;
}

bool solveNQueen(vector<vector<int>>& board, int row, int n)
{
    if (row == n)
    {
        return true;
    }

    for (int col = 0; col < n; col++)
    {
        if (isSafe(board, row, col, n))
        {
            board[row][col] = 1;

            if (solveNQueen(board, row + 1, n))
            {
                return true;
            }

            board[row][col] = 0;
        }
    }

    return false;
}

int main()
{
    int n = 4;

    vector<vector<int>> board(
        n,
        vector<int>(n, 0)
    );

    if (solveNQueen(board, 0, n))
    {
        cout << "Solution:" << endl;

        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                cout << board[i][j] << " ";
            }

            cout << endl;
        }
    }
    else
    {
        cout << "No solution exists" << endl;
    }

    return 0;
}', 'Solution:
0 1 0 0
0 0 0 1
1 0 0 0
0 0 1 0', 'PlaceQueen(row) = try every valid column in the current row and recursively solve PlaceQueen(row + 1); if no valid placement succeeds, backtrack.', 'O(N!)', 'O(N!)', 'O(N!)', 'O(N^2)', 'Constraint satisfaction problems, puzzle solving, scheduling, combinatorial search, artificial intelligence and demonstrating backtracking techniques.', 'Backtracking avoids exploring many invalid board configurations. It is simple to understand and demonstrates recursive search, constraint checking and systematic trial-and-error effectively.', 'The worst-case time complexity grows very quickly as N increases. A basic board implementation also requires additional space, and the algorithm becomes inefficient for very large values of N.', NULL, 'N-Queens', 'https://leetcode.com/problems/n-queens/', 'Hard'),
    ('Graph Coloring', 'graph-coloring', 'backtracking', 18, 'The Graph Coloring Problem assigns colors to the vertices of a graph so that no two adjacent vertices have the same color. The goal is to determine whether the graph can be colored using at most M colors.', '1. Start from the first vertex.
2. Try assigning one of the available colors to the current vertex.
3. Before assigning a color, check whether any adjacent vertex already has the same color.
4. If the color is safe, assign it to the current vertex.
5. Recursively move to the next vertex.
6. If no color can be assigned safely, backtrack to the previous vertex.
7. Remove the previous color assignment and try another color.
8. Continue until all vertices are colored.
9. If all vertices receive valid colors, a solution exists.', 'Consider a graph with four vertices and three available colors. The algorithm tries to assign colors one vertex at a time while ensuring adjacent vertices have different colors. If all four vertices can be colored without conflict, the graph is successfully colored.', '#include <iostream>
#include <vector>
using namespace std;

bool isSafe(
    int vertex,
    vector<vector<int>>& graph,
    vector<int>& color,
    int currentColor,
    int V
)
{
    for (int i = 0; i < V; i++)
    {
        if (graph[vertex][i] &&
            color[i] == currentColor)
        {
            return false;
        }
    }

    return true;
}

bool graphColoringUtil(
    vector<vector<int>>& graph,
    int m,
    vector<int>& color,
    int vertex,
    int V
)
{
    if (vertex == V)
    {
        return true;
    }

    for (int c = 1; c <= m; c++)
    {
        if (isSafe(vertex, graph, color, c, V))
        {
            color[vertex] = c;

            if (graphColoringUtil(
                    graph,
                    m,
                    color,
                    vertex + 1,
                    V
                ))
            {
                return true;
            }

            color[vertex] = 0;
        }
    }

    return false;
}

int main()
{
    int V = 4;
    int m = 3;

    vector<vector<int>> graph = {
        {0, 1, 1, 1},
        {1, 0, 1, 0},
        {1, 1, 0, 1},
        {1, 0, 1, 0}
    };

    vector<int> color(V, 0);

    if (graphColoringUtil(graph, m, color, 0, V))
    {
        cout << "Solution Exists" << endl;

        for (int i = 0; i < V; i++)
        {
            cout << "Vertex " << i
                 << " -> Color "
                 << color[i] << endl;
        }
    }
    else
    {
        cout << "No solution exists" << endl;
    }

    return 0;
}', 'Solution Exists
Vertex 0 -> Color 1
Vertex 1 -> Color 2
Vertex 2 -> Color 3
Vertex 3 -> Color 2', 'Color(vertex) = try each of M colors; if a color is safe, assign it and recursively color vertex + 1; otherwise backtrack.', 'O(M^V)', 'O(M^V)', 'O(M^V)', 'O(V)', 'Map coloring, exam scheduling, register allocation, frequency assignment, timetable generation, resource allocation and constraint satisfaction problems.', 'Backtracking eliminates invalid color assignments early. It is simple to implement and can determine whether a graph is colorable using a given number of colors.', 'The worst-case time complexity is exponential. It becomes inefficient for large graphs or when many colors and vertices must be explored.', NULL, 'Is Graph Bipartite?', 'https://leetcode.com/problems/is-graph-bipartite/', 'Medium')
) AS v (name, slug, topic_slug, display_order, description, working, example, cpp_code, output, recurrence, best_complexity, average_complexity, worst_complexity, space_complexity, applications, advantages, disadvantages, youtube_url, leetcode_title, leetcode_url, leetcode_difficulty)
LEFT JOIN topics t ON t.slug = v.topic_slug
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    display_order = EXCLUDED.display_order,
    description = EXCLUDED.description,
    working = EXCLUDED.working,
    example = EXCLUDED.example,
    cpp_code = EXCLUDED.cpp_code,
    output = EXCLUDED.output,
    recurrence = EXCLUDED.recurrence,
    best_complexity = EXCLUDED.best_complexity,
    average_complexity = EXCLUDED.average_complexity,
    worst_complexity = EXCLUDED.worst_complexity,
    space_complexity = EXCLUDED.space_complexity,
    applications = EXCLUDED.applications,
    advantages = EXCLUDED.advantages,
    disadvantages = EXCLUDED.disadvantages,
    youtube_url = EXCLUDED.youtube_url,
    leetcode_title = EXCLUDED.leetcode_title,
    leetcode_url = EXCLUDED.leetcode_url,
    leetcode_difficulty = EXCLUDED.leetcode_difficulty,
    topic_id = EXCLUDED.topic_id;

-- Algorithms removed from this file are removed from the app.
DELETE FROM algorithms WHERE slug NOT IN ('naive-pattern-searching', 'rabin-karp-algorithm', 'selection-sort', 'merge-sort', 'quick-sort', 'dijkstra-algorithm', 'bellman-ford-algorithm', 'floyd-warshall-algorithm', 'kruskal-algorithm', 'prims-algorithm', 'multistage-graph-shortest-path', 'travelling-salesman-problem', '0-1-knapsack', 'subset-sum-problem', 'longest-common-subsequence', 'fractional-knapsack', 'n-queen-problem', 'graph-coloring');
