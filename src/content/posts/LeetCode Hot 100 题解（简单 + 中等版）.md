---
title: LeetCode Hot 100 题解（简单 + 中等版）
published: 2026-08-26
description: 汇总 LeetCode Hot 100 中 88 道简单与中等题，包含解题思路、复杂度分析以及 Java、Python 实现。
tags:
  - LeetCode
  - 算法
  - Java
  - Python
category: 算法
draft: false
date: 2026-08-07T17:15:09+08:00
lastmod: 2026-08-31T15:09:13+08:00
---
本文档整理了 LeetCode Hot 100 中的简单题和中等题（共 88 题，已移除 12 道困难题），按分类组织，每题包含题目描述、便于面试记忆的解题方法、Java 和 Python 代码实现。

---

## 笔试速查表（考前 10 分钟扫一遍）

> 用法：看到题目 → 匹配「识别特征」→ 默写对应「模板骨架」。每题正文里还标注了它属于哪个模板。

### 模式 1：哈希表
- **识别特征**：找配对、去重、分组、O(1) 查找
- **骨架**：`Map` / `HashSet` + 一次遍历，先查后存
- **适用题**：1 两数之和、2 异位词分组、3 最长连续序列、10 和为 K 的子数组、32 随机链表复制

### 模式 2：双指针（左右收缩 / 快慢）
- **识别特征**：有序数组找区间、链表判环/找中点/倒数第 N
- **骨架**：`while (l < r)` 首尾收缩；`slow=slow.next; fast=fast.next.next` 快慢
- **适用题**：4 移动零、5 盛最多水、6 三数之和、22 相交链表、25/26 环形链表、29 删除倒数第 N、98 颜色分类、100 寻找重复数

### 模式 3：滑动窗口
- **识别特征**：连续子串/子数组、最长/最短
- **骨架**：右指针扩张 + 左指针收缩，`while` 维护窗口合法性
- **适用题**：8 无重复最长子串、9 字母异位词

### 模式 4：前缀和
- **识别特征**：连续子数组求和、求区间和等于 k
- **骨架**：`preSum` 累加 + `Map` 存 `{前缀和: 次数}`，查 `preSum - k`
- **适用题**：10 和为 K 的子数组、48 路径总和 III

### 模式 5：二分查找
- **识别特征**：有序数组/矩阵、找边界、旋转数组
- **骨架**：`while (l <= r)` 或 `while (l < r)`；`mid = l + (r-l)/2`
- **适用题**：63 搜索插入、64 搜索二维矩阵、65 查找区间、66/67 旋转数组、87 LIS 优化

### 模式 6：链表操作
- **识别特征**：反转、合并、两两交换、复制
- **骨架**：`dummy` 节点 + 三指针；`next = cur.next; cur.next = pre; pre = cur; cur = next`
- **适用题**：23 反转链表、24 回文链表、27 合并有序、28 两数相加、30 两两交换、33 排序链表、35 LRU 缓存

### 模式 7：二叉树遍历（DFS 递归 / BFS 层序 / 中序栈）
- **识别特征**：树的深度、翻转、对称、直径、构造、祖先
- **骨架**：递归 `fn(root) = 处理(root) + fn(left) + fn(right)`；层序用队列按 `size` 分组
- **适用题**：36~49 全部二叉树题

### 模式 8：图遍历（BFS / DFS / 拓扑排序）
- **识别特征**：网格岛屿、扩散感染、依赖关系
- **骨架**：`visited` + 四方向；拓扑排序 = 入度数组 + 队列
- **适用题**：51 岛屿数量、52 腐烂橘子、53 课程表

### 模式 9：回溯（DFS + 撤销）
- **识别特征**：全排列、组合、子集、所有方案
- **骨架**：`backtrack(path) { 选; backtrack; 撤销; }`
- **适用题**：55 全排列、56 子集、57 电话号码、58 组合总和、59 括号生成、60 单词搜索、61 分割回文串

### 模式 10：栈 / 单调栈
- **识别特征**：括号匹配、下一个更大、解码嵌套
- **骨架**：普通栈 / 双栈 / 单调递减栈存下标
- **适用题**：69 有效括号、70 最小栈、71 字符串解码、72 每日温度

### 模式 11：堆
- **识别特征**：第 K 大、前 K 高、动态中位数
- **骨架**：`PriorityQueue`（最小堆）维护大小为 k
- **适用题**：74 第 K 大元素、75 前 K 高频

### 模式 12：动态规划
- **识别特征**：最优值、计数、能否、最少步数、子序列
- **骨架**：定义 `dp[i]` 含义 → 找转移方程 → 初始化 → 空间优化
- **适用题**：81 爬楼梯、82 杨辉三角、83 打家劫舍、84 完全平方数、85 零钱兑换、86 单词拆分、87 LIS、88 乘积最大、89 分割等和、91 不同路径、92 最小路径和、94 LCS、95 编辑距离

### 模式 13：贪心
- **识别特征**：最远可达、最大利润、最少次数
- **骨架**：每步取局部最优，维护 `maxReach` / `minPrice` / `curEnd`
- **适用题**：77 买卖股票、78/79 跳跃游戏、80 划分字母区间

### 模式 14：特殊技巧
- **识别特征**：特定约束（只出现一次、多数、原地排序、下一个排列）
- **骨架**：异或、投票、三指针、三步反转
- **适用题**：13 Kadane、15 轮转、16 除自身乘积、18~21 矩阵、96 只出现一次、97 多数元素、99 下一个排列

---

## 一、数组

### 1. 两数之和（简单）

**题目描述：** 给定整数数组 `nums` 和目标值 `target`，找出数组中和为目标值的两个数，返回其下标。

**解题思路：** 哈希表存储已遍历元素的值→下标映射。遍历时计算 `target - nums[i]`，若在哈希表中则找到答案，否则将当前元素存入哈希表。O(n) 时间，O(n) 空间。

**记忆点：**
- **口诀**：先查后存，避免自己配自己
- **模板**：哈希表（模式 1）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：先 `containsKey` 判断再 `put`，顺序反了会自己和自己配对

**示例：**
> 输入：nums = [2,7,11,15], target = 9
> 输出：[0,1]

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>(); // key=值, value=下标
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i]; // 要找的配对值
            if (map.containsKey(complement)) { // ★ 核心：先查配对
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i); // 先检查再放入，避免自己和自己配对
        }
        return new int[]{-1, -1};
    }
}
```

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}  # key=值, value=下标
        for i, num in enumerate(nums):
            complement = target - num  # 要找的配对值
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i  # 遍历完再放进去，避免自己和自己配对
        return []
```

---

### 2. 字母异位词分组（中等）

**题目描述：** 给定字符串数组，将字母异位词（字母相同但排列不同）分组。

**解题思路：** 对每个字符串排序作为 key，用哈希表分组。或者统计每个字符出现次数（如 "a1b2c3"）作为 key。O(n·klogk) 或 O(n·k)。

**记忆点：**
- **口诀**：排序当 key，异位归一
- **模板**：哈希表（模式 1）
- **复杂度**：O(n·klogk) 时间 / O(n·k) 空间
- **坑**：key 必须是「排序后的字符串」或「字符计数」，异位词才会落到同一 key

**示例：**
> 输入：strs = ["eat","tea","tan","ate","nat","bat"]
> 输出：[["bat"],["nat","tan"],["ate","eat","tea"]]

```java
class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        // key = 排序后的字符串，value = 该组内所有异位词
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            // 核心：互为字母异位词的两个字符串，排序后一定完全相同
            // 所以「排序后的字符串」就是天然的分组 key
            char[] chars = s.toCharArray();
            Arrays.sort(chars);            // 排序，让异位词归一到同一个 key
            String key = new String(chars); // ★ 排序后作为异位词统一 key
            // computeIfAbsent：key 不存在则先用空列表初始化，再追加当前单词
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        // map 的 value 集合即所有分组
        return new ArrayList<>(map.values());
    }
}
```

```python
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = {}
        for s in strs:
            # 核心：异位词排序后相同，用排序后的字符串作为 key 分组
            key = ''.join(sorted(s))  # 排序后异位词key相同
            # setdefault：key 不存在时先用 [] 初始化，再追加当前单词
            groups.setdefault(key, []).append(s)
        return list(groups.values())
```

---

### 3. 最长连续序列（中等）

**题目描述：** 给定未排序的整数数组，找出最长连续数字序列的长度。要求 O(n) 时间。

**解题思路：** 将所有数字存入 HashSet。遍历每个数，只有当它是连续序列的起点（`num-1` 不在集合中）时，才向后延伸计算长度。每个数最多访问两次，O(n)。

**记忆点：**
- **口诀**：只从起点开始数，避免重复延伸
- **模板**：哈希表（HashSet）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：必须判断 `num-1` 不在集合才延伸，否则退化成 O(n²)

**示例：**
> 输入：nums = [100,4,200,1,3,2]
> 输出：4

```java
class Solution {
    public int longestConsecutive(int[] nums) {
        // HashSet 提供 O(1) 的去重与查找
        Set<Integer> set = new HashSet<>();
        for (int num : nums) set.add(num);
        int maxLen = 0;
        for (int num : set) {
            // 关键优化：只有 num-1 不在集合中，num 才是一个连续序列的「起点」
            // 只从起点向后延伸，每个数最多被访问两次（判起点 + 延伸），整体 O(n)
            if (!set.contains(num - 1)) { // ★ 只从序列起点开始，避免重复延伸
                int cur = num, len = 1;
                while (set.contains(cur + 1)) { // 起点已知，向后依次延伸计数
                    cur++;
                    len++;
                }
                maxLen = Math.max(maxLen, len);
            }
        }
        return maxLen;
    }
}
```

```python
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)  # 去重 + O(1) 查找
        max_len = 0
        for num in num_set:
            # 只有 num-1 不在集合中才是序列起点，避免每个序列被重复统计
            if num - 1 not in num_set:  # 序列起点
                cur, length = num, 1
                while cur + 1 in num_set:  # 从起点向后延伸
                    cur += 1
                    length += 1
                max_len = max(max_len, length)
        return max_len
```

---

## 二、双指针

### 4. 移动零（简单）

**题目描述：** 将数组中所有0移到末尾，保持非零元素相对顺序，必须原地操作。

**解题思路：** 快慢指针，`i` 遍历数组，`j` 指向下一个非零元素应放的位置。遇到非零数就交换 `nums[i]` 和 `nums[j]`，`j++`。本质是把非零数往前搬。

**记忆点：**
- **口诀**：非零往前搬，j 是写入位
- **模板**：双指针（快慢）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：用「交换」而非「覆盖」，否则被覆盖位置的 0 会丢，末尾零数量不对

**示例：**
> 输入：nums = [0,1,0,3,12]
> 输出：[1,3,12,0,0]

```java
class Solution {
    public void moveZeroes(int[] nums) {
        int j = 0; // 下一个非零元素应放的位置
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) { // ★ 非零往前搬
                int tmp = nums[i];
                nums[i] = nums[j];
                nums[j] = tmp;
                j++;
            }
        }
    }
}
```

```python
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        j = 0  # 下一个非零元素应放的位置
        for i in range(len(nums)):
            if nums[i] != 0:
                nums[i], nums[j] = nums[j], nums[i]
                j += 1
```

---

### 5. 盛最多水的容器（中等）

**题目描述：** 给定数组 `height` 表示垂直线高度，找出两条线与x轴构成的最大容器面积。

**解题思路：** 左右双指针向中间收缩。每次计算面积后，移动较短的那边（因为面积由短板决定，移动长板不可能增大面积）。O(n)。

**记忆点：**
- **口诀**：短板决定面积，移短才可能变大
- **模板**：双指针（左右）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：移动长板面积一定不增，所以永远只移短板那侧

**示例：**
> 输入：height = [1,8,6,2,5,4,8,3,7]
> 输出：49

```java
class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1; // 左右指针从两端向中间收缩
        int maxArea = 0;
        while (l < r) {
            // 容器宽 = r-l，高 = 两板中较矮的（木桶原理：装水量由短板决定）
            int area = (r - l) * Math.min(height[l], height[r]);
            maxArea = Math.max(maxArea, area);
            // 核心：移动长板时宽度变小、高度不变，面积必然不增；
            // 只有移动短板，才可能让「更高的板」进入容器从而增大面积
            if (height[l] < height[r]) l++; // ★ 短板决定面积，移短才可能变大
            else r--;
        }
        return maxArea;
    }
}
```

```python
class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1  # 左右指针从两端收缩
        max_area = 0
        while l < r:
            # 面积 = 宽(r-l) × 高(较矮的板)，高度由短板决定
            area = (r - l) * min(height[l], height[r])
            max_area = max(max_area, area)
            # 移动长板面积一定不增，永远移动短板一侧
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return max_area
```

---

### 6. 三数之和（中等）

**题目描述：** 找出数组中所有和为 0 且不重复的三元组。

**解题思路：** 排序后固定一个数，对剩余部分用双指针找两数之和等于 -nums[i]。关键：跳过重复元素避免重复结果。O(n^2)。

**记忆点：**
- **口诀**：排序固定一，双指针夹逼，三处去重
- **模板**：排序 + 双指针
- **复杂度**：O(n²) 时间 / O(1) 空间（不含结果）
- **坑**：`i`、`l`、`r` 三处都要去重，漏一处就出重复三元组；`nums[i] > 0` 可提前剪枝

**示例：**
> 输入：nums = [-1,0,1,2,-1,-4]
> 输出：[[-1,-1,2],[-1,0,1]]

```java
class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // 先排序：相同元素相邻便于去重，同时让双指针法可用
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) { // 固定第一个数，至少留两个位置给 l、r
            if (nums[i] > 0) break;   // 剪枝：最小数 >0，后面全正，和不可能为 0
            if (i > 0 && nums[i] == nums[i - 1]) continue; // 去重：固定数不重复
            int l = i + 1, r = nums.length - 1; // 双指针夹逼找剩下两个数
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r]; // ★ 排序 + 双指针夹逼
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++; // 去重：跳过重复左值
                    while (l < r && nums[r] == nums[r - 1]) r--; // 去重：跳过重复右值
                    l++; r--; // 找到一组后两指针同时收缩
                } else if (sum < 0) l++; // 和太小 → 左指针右移增大
                else r--;               // 和太大 → 右指针左移减小
            }
        }
        return res;
    }
}
```

```python
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()  # 排序：方便去重 + 双指针
        res = []
        for i in range(len(nums) - 2):  # 固定第一个数
            if nums[i] > 0: break  # 剪枝：最小数 >0 无法和为 0
            if i > 0 and nums[i] == nums[i - 1]: continue  # 去重固定数
            l, r = i + 1, len(nums) - 1
            while l < r:
                total = nums[i] + nums[l] + nums[r]
                if total == 0:
                    res.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l + 1]: l += 1  # 去重左值
                    while l < r and nums[r] == nums[r - 1]: r -= 1  # 去重右值
                    l += 1; r -= 1  # 两指针同时收缩
                elif total < 0:
                    l += 1  # 和太小，左移
                else:
                    r -= 1  # 和太大，右移
        return res
```

---

## 三、滑动窗口

### 8. 无重复字符的最长子串（中等）

**题目描述：** 找出字符串中不含重复字符的最长子串长度。

**解题思路：** 滑动窗口 + HashSet/字典。右指针扩展窗口，遇到重复字符时左指针跳到 `重复字符上次位置+1`。用字典记录字符最后一次出现位置。O(n)。

**记忆点：**
- **口诀**：右扩左跳，字典记位置
- **模板**：滑动窗口（模式 3）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：`l = max(l, 上次位置+1)`，必须取 max，否则 l 会回退到已经跳过的旧位置

**示例：**
> 输入：s = "abcabcbb"
> 输出：3 （最长子串 "abc"）

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        // map 记录每个字符最后一次出现的位置
        Map<Character, Integer> map = new HashMap<>();
        int l = 0, maxLen = 0; // l = 窗口左边界，r = 窗口右边界（滑动窗口）
        for (int r = 0; r < s.length(); r++) {
            char c = s.charAt(r);
            if (map.containsKey(c)) {
                // 遇到重复字符：窗口左边界跳到「该字符上次出现位置 + 1」
                // 取 max 防止 l 回退：上次位置可能已经滑出当前窗口（被 l 跳过）
                l = Math.max(l, map.get(c) + 1); // ★ max 防止 l 回退
            }
            map.put(c, r);              // 记录/更新当前字符的最新位置
            maxLen = Math.max(maxLen, r - l + 1); // 当前窗口长度 r-l+1
        }
        return maxLen;
    }
}
```

```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pos = {}
        l = max_len = 0
        for r, ch in enumerate(s):
            if ch in pos:
                l = max(l, pos[ch] + 1)  # max防止l回退到已经跳过的旧位置
            pos[ch] = r
            max_len = max(max_len, r - l + 1)
        return max_len
```

---

### 9. 找到字符串中所有字母异位词（中等）

**题目描述：** 找出字符串 s 中所有 p 的字母异位词的起始下标。

**解题思路：** 固定大小滑动窗口。维护两个长度为 26 的计数数组分别统计 p 和当前窗口的字符频率，当两个数组相等时记录起始位置。O(n)。

**记忆点：**
- **口诀**：定长窗口 + 双计数数组比较
- **模板**：滑动窗口（模式 3）
- **复杂度**：O(n) 时间 / O(1) 空间（固定 26 大小）
- **坑**：窗口长度固定为 `p.length()`，超长时先移出最左字符再比较

**示例：**
> 输入：s = "cbaebabacd", p = "abc"
> 输出：[0,6]

```java
class Solution {
    public List<Integer> findAnagrams(String s, String p) {
        List<Integer> res = new ArrayList<>();
        if (s.length() < p.length()) return res; // 窗口装不下 p，直接返回
        int[] pCnt = new int[26], winCnt = new int[26]; // 两个长度 26 的计数数组
        for (char c : p.toCharArray()) pCnt[c - 'a']++; // 统计 p 中每个字符出现频率
        for (int i = 0; i < s.length(); i++) {
            winCnt[s.charAt(i) - 'a']++; // 窗口右端进入一个字符，频率 +1
            // 固定窗口长度 = p.length()：一旦超过，把最左侧字符移出窗口
            if (i >= p.length()) winCnt[s.charAt(i - p.length()) - 'a']--;
            // 两个频率数组相等 = 当前窗口就是 p 的一个异位词
            // Arrays.equals 比较 26 个元素，O(26)=O(1)；记录窗口起点 i-len+1
            if (Arrays.equals(pCnt, winCnt)) res.add(i - p.length() + 1); // ★ 定长窗口比较频率
        }
        return res;
    }
}
```

```python
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        res = []
        if len(s) < len(p): return res  # 窗口装不下 p
        p_cnt = [0] * 26
        win_cnt = [0] * 26
        for ch in p:
            p_cnt[ord(ch) - 97] += 1  # 统计 p 的字符频率
        for i, ch in enumerate(s):
            win_cnt[ord(ch) - 97] += 1  # 窗口右端进字符
            # 固定窗口长度 = len(p)，超过则移除最左侧字符
            if i >= len(p):
                win_cnt[ord(s[i - len(p)]) - 97] -= 1
            # 频率相等即异位词，记录窗口起点
            if p_cnt == win_cnt:
                res.append(i - len(p) + 1)
        return res
```

---

## 四、子串

### 10. 和为 K 的子数组（中等）

**题目描述：** 统计数组中连续子数组的和等于 k 的个数。

**解题思路：** 前缀和 + 哈希表。`preSum[i]` 表示 `nums[0..i-1]` 的和。对于当前位置 `r`，需要找有多少个 `l < r` 使得 `preSum[r] - preSum[l] = k`，即 `preSum[l] = preSum[r] - k`。用哈希表记录每个前缀和出现次数。O(n)。

**记忆点：**
- **口诀**：前缀和相减，哈希存次数
- **模板**：前缀和 + 哈希表（模式 4）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：必须先 `map.put(0, 1)` 哨兵，否则漏掉「从开头累加 = k」的子数组；先查后存避免用自己

**示例：**
> 输入：nums = [1,1,1], k = 2
> 输出：2

```java
class Solution {
    public int subarraySum(int[] nums, int k) {
        // key = 前缀和，value = 该前缀和出现过的次数
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1); // 哨兵：前缀和为 0 出现 1 次，处理「从开头累加 = k」的子数组
        int preSum = 0, count = 0;
        for (int num : nums) {
            preSum += num; // 累加前缀和（nums[0..当前] 之和）
            // 区间 [l, r] 的和 = 前缀和[r] - 前缀和[l-1]
            // 要找 preSum - x = k → x = preSum - k
            // x 出现几次 = 以当前元素结尾的合法子数组有几个
            count += map.getOrDefault(preSum - k, 0); // ★ 前缀和相减找区间
            map.put(preSum, map.getOrDefault(preSum, 0) + 1); // 记录当前前缀和（先查后存）
        }
        return count;
    }
}
```

```python
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        pre_sum_count = {0: 1}  # 哨兵：前缀和 0 出现 1 次，处理从开头累加=k
        pre_sum = count = 0
        for num in nums:
            pre_sum += num  # 累加前缀和
            # 区间和 = pre_sum - 历史前缀和；找历史前缀和 = pre_sum - k 的出现次数
            count += pre_sum_count.get(pre_sum - k, 0)
            # 记录当前前缀和（先查后存，避免统计到自身）
            pre_sum_count[pre_sum] = pre_sum_count.get(pre_sum, 0) + 1
        return count
```

---

## 五、普通数组

### 13. 最大子数组和（中等）

**题目描述：** 找出连续子数组的最大和（Kadane 算法）。

**解题思路：** `dp[i] = max(dp[i-1] + nums[i], nums[i])`，即要么接上前面的子数组，要么从当前位置重新开始。可优化为 O(1) 空间：用 `cur` 代替 `dp[i-1]`。O(n)。

**记忆点：**
- **口诀**：延续 or 重启，取最大（Kadane）
- **模板**：动态规划 / 特殊技巧
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：`cur = max(cur + num, num)` 中「重启」分支不能丢，否则全是负数时会算错

**示例：**
> 输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
> 输出：6 （子数组 [4,-1,2,1]）

```java
class Solution {
    public int maxSubArray(int[] nums) {
        // cur：以「当前位置」结尾的最大子数组和；maxSum：全局最大
        int cur = nums[0], maxSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            // Kadane 核心，两个选择取最大：
            // 1) cur + nums[i]：把当前元素接进之前的子数组（延续）
            // 2) nums[i]：之前累积为负会拖累结果，果断从当前位置重新开始
            // 保证 cur 永远是「以 i 结尾」的最大子数组和
            cur = Math.max(cur + nums[i], nums[i]); // ★ Kadane：延续 or 重启
            maxSum = Math.max(maxSum, cur); // 更新全局最大值
        }
        return maxSum;
    }
}
```

```python
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur = max_sum = nums[0]  # cur：以当前位置结尾的最大和
        for num in nums[1:]:
            # 延续 or 重启：之前累积为负就丢弃，从当前元素重新开始
            cur = max(cur + num, num)
            max_sum = max(max_sum, cur)  # 更新全局最大
        return max_sum
```

---

### 14. 合并区间（中等）

**题目描述：** 合并所有重叠的区间。

**解题思路：** 按区间起点排序，遍历时如果当前区间起点 <= 上一个区间终点，则合并（终点取 max）；否则加入新区间。O(nlogn)。

**记忆点：**
- **口诀**：按起点排序，重叠就拉长终点
- **模板**：排序
- **复杂度**：O(nlogn) 时间 / O(n) 空间
- **坑**：先排序保证重叠区间相邻；合并时终点取 `max`，不是直接覆盖

**示例：**
> 输入：intervals = [[1,3],[2,6],[8,10],[15,18]]
> 输出：[[1,6],[8,10],[15,18]]

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        // 先按起点排序：排序后可能重叠的区间必然相邻，只需和结果里最后一个比较
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        List<int[]> res = new ArrayList<>();
        res.add(intervals[0]); // 第一个区间直接放入结果
        for (int i = 1; i < intervals.length; i++) {
            int[] last = res.get(res.size() - 1); // 结果中最后一个区间
            // 当前区间起点 <= 上一个终点 → 重叠，合并：终点取两者较大
            if (intervals[i][0] <= last[1]) { // ★ 起点 <= 上终点则重叠
                last[1] = Math.max(last[1], intervals[i][1]);
            } else {
                res.add(intervals[i]); // 不重叠 → 作为新区间加入
            }
        }
        return res.toArray(new int[res.size()][]); // List<int[]> 转 int[][]
    }
}
```

```python
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])  # 按起点排序，重叠区间必然相邻
        res = [intervals[0]]  # 第一个区间直接放入
        for start, end in intervals[1:]:
            # 起点 <= 结果里最后一个区间的终点 → 重叠，终点取较大
            if start <= res[-1][1]:
                res[-1][1] = max(res[-1][1], end)
            else:
                res.append([start, end])  # 不重叠，作为新区间加入
        return res
```

---

### 15. 轮转数组（中等）

**题目描述：** 将数组向右轮转 k 步，原地操作。

**解题思路：** 三次反转：①反转整个数组；②反转前 k 个；③反转剩余部分。注意 k %= n。O(n) 时间，O(1) 空间。

**记忆点：**
- **口诀**：整体反转 + 两段各自反转
- **模板**：特殊技巧（三次反转）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：先 `k %= n`，否则 k 大于 n 时多做无效轮转

**示例：**
> 输入：nums = [1,2,3,4,5,6,7], k = 3
> 输出：[5,6,7,1,2,3,4]

```java
class Solution {
    public void rotate(int[] nums, int k) {
        k %= nums.length; // k 可能大于 n，取模去掉完整圈数（转一圈等于没转）
        // 三次反转 = 右移 k 步（可画图验证）：
        // ① 整体反转 ② 前 k 个反转 ③ 剩余部分反转
        reverse(nums, 0, nums.length - 1); // ★ 三次反转
        reverse(nums, 0, k - 1);
        reverse(nums, k, nums.length - 1);
    }
    // 双指针原地反转 [l, r] 区间
    private void reverse(int[] nums, int l, int r) {
        while (l < r) {
            int tmp = nums[l];
            nums[l] = nums[r];
            nums[r] = tmp;
            l++; r--;
        }
    }
}
```

```python
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        k %= len(nums)  # k 可能大于 n，取模去掉完整圈数
        # 三次反转 = 右移 k 步：整体反转 → 前 k 个反转 → 剩余反转
        nums.reverse()
        nums[:k] = reversed(nums[:k])
        nums[k:] = reversed(nums[k:])
```

---

### 16. 除自身以外数组的乘积（中等）

**题目描述：** 返回数组 answer，其中 answer[i] 等于 nums 中除 nums[i] 外其余元素的乘积。不能使用除法，O(n)。

**解题思路：** 两次遍历：第一次从左到右计算每个位置左边所有元素的乘积；第二次从右到左乘上右边所有元素的乘积。O(n) 时间，O(1) 额外空间（不算输出数组）。

**记忆点：**
- **口诀**：左乘积存数组，右乘积边乘边更新
- **模板**：前缀积 / 后缀积
- **复杂度**：O(n) 时间 / O(1) 空间（不含输出）
- **坑**：`res[0] = 1` 和 `right = 1` 两个哨兵不能漏，否则首尾元素算错

**示例：**
> 输入：nums = [1,2,3,4]
> 输出：[24,12,8,6]

```java
class Solution {
    public int[] productExceptSelf(int[] nums) {
        int n = nums.length;
        int[] res = new int[n];
        res[0] = 1; // 第一个位置左边没有元素，初始为 1（乘法单位元）
        // 第一遍从左到右：res[i] = nums[0..i-1] 的乘积（i 左侧所有元素之积）
        for (int i = 1; i < n; i++) {
            res[i] = res[i - 1] * nums[i - 1]; // ★ 左乘积
        }
        // 第二遍从右到左：right 累计右侧所有元素之积，边遍历边乘进 res
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            res[i] *= right;   // 左侧乘积 × 右侧乘积 = 除自身外的乘积
            right *= nums[i];  // 更新右侧累积乘积，为下一个位置准备
        }
        return res;
    }
}
```

```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        res = [1] * n
        # 第一遍从左到右：res[i] = 左侧所有元素之积
        for i in range(1, n):
            res[i] = res[i - 1] * nums[i - 1]
        # 第二遍从右到左：right 累计右侧乘积，乘入 res 得答案
        right = 1
        for i in range(n - 1, -1, -1):
            res[i] *= right  # 左积 × 右积 = 除自身外乘积
            right *= nums[i]  # 更新右侧累积
        return res
```

---

## 六、矩阵

### 18. 矩阵置零（中等）

**题目描述：** 若矩阵中某个元素为 0，将其所在行和列全部置 0，原地操作。

**解题思路：** 用矩阵的第一行和第一列作为标记位。先记录第一行/列本身是否有 0，再遍历矩阵用首行首列标记，最后根据标记置零并处理首行首列。

**记忆点：**
- **口诀**：首行首列当标记，先存自身再置零
- **模板**：特殊技巧（原地标记）
- **复杂度**：O(mn) 时间 / O(1) 空间
- **坑**：必须先单独记录第一行/列是否有 0，否则标记信息会被覆盖丢失

**示例：**
> 输入：matrix = [[1,1,1],[1,0,1],[1,1,1]]
> 输出：[[1,0,1],[0,0,0],[1,0,1]]

```java
class Solution {
    public void setZeroes(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        // 技巧：用第一行、第一列当「标记位」，记录其余行/列是否需要置零，省掉 O(mn) 额外数组
        // 但第一行/列自身的置零需求不能丢，先单独保存
        boolean firstRowZero = false, firstColZero = false;
        for (int j = 0; j < n; j++) if (matrix[0][j] == 0) firstRowZero = true;
        for (int i = 0; i < m; i++) if (matrix[i][0] == 0) firstColZero = true;

        // 遍历内层（从 1 开始，不动第一行/列，避免污染标记信息）
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (matrix[i][j] == 0) {
                    // 在标记位打 0：表示第 i 行、第 j 列需要置零
                    matrix[i][0] = 0; // ★ 首行首列做标记
                    matrix[0][j] = 0;
                }
        // 根据标记把内层元素置零
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (matrix[i][0] == 0 || matrix[0][j] == 0)
                    matrix[i][j] = 0;
        // 最后处理第一行/列（用之前保存的 firstRowZero / firstColZero）
        if (firstRowZero) for (int j = 0; j < n; j++) matrix[0][j] = 0;
        if (firstColZero) for (int i = 0; i < m; i++) matrix[i][0] = 0;
    }
}
```

```python
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        # 用第一行/列当标记位（O(1) 空间），先单独保存它们自身的置零需求
        first_row_zero = any(matrix[0][j] == 0 for j in range(n))
        first_col_zero = any(matrix[i][0] == 0 for i in range(m))
        # 遍历内层，把 0 标记到第一行/列对应位置
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][j] == 0:
                    matrix[i][0] = matrix[0][j] = 0
        # 按标记把内层置零
        for i in range(1, m):
            for j in range(1, n):
                if matrix[i][0] == 0 or matrix[0][j] == 0:
                    matrix[i][j] = 0
        # 最后处理第一行/列
        if first_row_zero:
            for j in range(n): matrix[0][j] = 0
        if first_col_zero:
            for i in range(m): matrix[i][0] = 0
```

---

### 19. 螺旋矩阵（中等）

**题目描述：** 按顺时针螺旋顺序返回矩阵所有元素。

**解题思路：** 定义四条边界 `top/bottom/left/right`，按 右→下→左→上 的顺序遍历，每遍历完一条边缩紧边界，直到边界越界。

**记忆点：**
- **口诀**：四边界顺时针缩，走完一边收一边
- **模板**：特殊技巧（边界收缩）
- **复杂度**：O(mn) 时间 / O(1) 空间（不含输出）
- **坑**：向左、向上前必须判断 `top<=bottom`、`left<=right`，否则单行/单列会重复遍历

**示例：**
> 输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
> 输出：[1,2,3,6,9,8,7,4,5]

```java
class Solution {
    public List<Integer> spiralOrder(int[][] matrix) {
        List<Integer> res = new ArrayList<>();
        // 四条边界围成当前「未遍历的矩形」，每走完一条边就收紧对应边界
        int top = 0, bottom = matrix.length - 1;
        int left = 0, right = matrix[0].length - 1;
        while (top <= bottom && left <= right) {
            // ① 向右：遍历上边界，走完上边界下移一行
            for (int j = left; j <= right; j++) res.add(matrix[top][j]); // ★ 走完上边收 top
            top++;
            // ② 向下：遍历右边界，走完右边界左移一列
            for (int i = top; i <= bottom; i++) res.add(matrix[i][right]);
            right--;
            // ③ 向左：只剩单行/单列时这里会重复遍历，必须先检查边界
            if (top <= bottom) {
                for (int j = right; j >= left; j--) res.add(matrix[bottom][j]);
                bottom--;
            }
            // ④ 向上：同理需要检查边界
            if (left <= right) {
                for (int i = bottom; i >= top; i--) res.add(matrix[i][left]);
                left++;
            }
        }
        return res;
    }
}
```

```python
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        res = []
        # 四条边界围成当前未遍历的矩形
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        while top <= bottom and left <= right:
            # ① 向右遍历上边界，走完上移
            for j in range(left, right + 1): res.append(matrix[top][j])
            top += 1
            # ② 向下遍历右边界，走完左移
            for i in range(top, bottom + 1): res.append(matrix[i][right])
            right -= 1
            # ③ 向左：单行/单列时需检查边界避免重复
            if top <= bottom:
                for j in range(right, left - 1, -1): res.append(matrix[bottom][j])
                bottom -= 1
            # ④ 向上：同理检查边界
            if left <= right:
                for i in range(bottom, top - 1, -1): res.append(matrix[i][left])
                left += 1
        return res
```

---

### 20. 旋转图像（中等）

**题目描述：** 将 n×n 矩阵顺时针旋转 90 度，原地操作。

**解题思路：** 先沿对角线（左上↔右下）翻转，再沿竖直中轴线左右翻转。即 `matrix[i][j] ↔ matrix[j][i]`，然后每行反转。

**记忆点：**
- **口诀**：对角线翻一次，再左右翻一次
- **模板**：特殊技巧（两次翻转）
- **复杂度**：O(n²) 时间 / O(1) 空间
- **坑**：对角线翻转时 `j` 从 `i+1` 开始，避免重复交换翻两次又翻回去

**示例：**
> 输入：matrix = [[1,2,3],[4,5,6],[7,8,9]]
> 输出：[[7,4,1],[8,5,2],[9,6,3]]

```java
class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        // 技巧：顺时针旋转 90° = 先「沿主对角线翻转」+ 再「每行水平翻转」（可画图验证）
        // 对角线翻转：matrix[i][j] ↔ matrix[j][i]
        // 只遍历右上三角（j 从 i+1 开始），避免左下三角重复交换又换回去
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++) {
                int tmp = matrix[i][j];
                matrix[i][j] = matrix[j][i]; // ★ 对角线翻转
                matrix[j][i] = tmp;
            }
        // 每行水平翻转：左右对称位置交换
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n / 2; j++) {
                int tmp = matrix[i][j];
                matrix[i][j] = matrix[i][n - 1 - j];
                matrix[i][n - 1 - j] = tmp;
            }
    }
}
```

```python
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        # 旋转 90° = 主对角线翻转 + 每行水平翻转
        # 对角线翻转：只处理右上三角（j 从 i+1 开始），避免重复交换
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        # 每行水平翻转（整行 reverse）
        for i in range(n):
            matrix[i].reverse()
```

---

### 21. 搜索二维矩阵 II（中等）

**题目描述：** 在每行每列都升序排列的矩阵中搜索目标值。

**解题思路：** 从右上角开始：`matrix[i][j] > target` 则左移，`< target` 则下移。O(m+n)。

**记忆点：**
- **口诀**：右上角起步，大左移小下移
- **模板**：特殊技巧（单调搜索）
- **复杂度**：O(m+n) 时间 / O(1) 空间
- **坑**：从右上角或左下角开始（利用行增列增），不要从左上角（两边都更大，无法判定方向）

**示例：**
> 输入：matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target = 5
> 输出：true

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        // 从右上角开始：它是「所在行的最大值 + 所在列的最小值」，构成判定锚点，
        // 每一步能确定唯一的移动方向（不会像左上角那样两个方向都大于 target）
        int i = 0, j = matrix[0].length - 1;
        while (i < matrix.length && j >= 0) {
            if (matrix[i][j] == target) return true;
            // 当前值 > target：本列元素都 ≥ 当前值，target 不可能在本列 → 左移一列
            else if (matrix[i][j] > target) j--; // ★ 右上角起步，大左移
            // 当前值 < target：本行元素都 ≤ 当前值，target 不可能在本行 → 下移一行
            else i++;
        }
        return false;
    }
}
```

```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        # 从右上角开始：每一步都能确定唯一方向（大左移、小下移）
        i, j = 0, len(matrix[0]) - 1
        while i < len(matrix) and j >= 0:
            if matrix[i][j] == target:
                return True
            # 当前值 > target：本列都更大，target 不可能在本列，左移
            elif matrix[i][j] > target:
                j -= 1
            # 当前值 < target：本行都更小，target 不可能在本行，下移
            else:
                i += 1
        return False
```

---

## 七、链表

### 22. 相交链表（简单）

**题目描述：** 找出两个单链表相交的起始节点。

**解题思路：** 双指针各自遍历两条链表，走到尾部后切换到对方链表头部继续遍历。两指针相遇处即为交点（或都为 null 表示不相交）。

**记忆点：**
- **口诀**：走完自己走对方，消除长度差
- **模板**：双指针（模式 2）
- **复杂度**：O(m+n) 时间 / O(1) 空间
- **坑**：指针走到 null 时切到「另一条链表头」而非「自己头」，否则死循环

**示例：**
> 输入：intersectVal = 8, listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3
> 输出：Intersected at '8'

```java
public class Solution {
    public ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        ListNode a = headA, b = headB;
        while (a != b) {
            // a走到null后切换到headB，消除长度差
            a = a == null ? headB : a.next; // ★ 走完自己走对方，消除长度差
            b = b == null ? headA : b.next;
        }
        return a;
    }
}
```

```python
class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> ListNode:
        a, b = headA, headB
        while a != b:
            # 走到尾部后切换到对方链表，消除长度差
            a = a.next if a else headB
            b = b.next if b else headA
        return a
```

---

### 23. 反转链表（简单）

**题目描述：** 反转单链表。

**解题思路：** 迭代法：`pre`、`cur`、`next` 三指针。`next = cur.next`，`cur.next = pre`，`pre = cur`，`cur = next`。O(n)，O(1)。

**记忆点：**
- **口诀**：暂存 next，反转指向前，双双前移
- **模板**：链表操作（模式 6）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：必须先用 `next` 暂存 `cur.next`，否则改向后就找不到下一个节点了

**示例：**
> 输入：head = [1,2,3,4,5]
> 输出：[5,4,3,2,1]

```java
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode pre = null, cur = head; // pre指向前一个节点，cur指向当前节点
        while (cur != null) {
            ListNode next = cur.next; // 暂存下一个节点，防止断链
            cur.next = pre; // ★ 反转指针方向
            pre = cur;      // pre前进
            cur = next;     // cur前进
        }
        return pre; // pre最终指向反转后的头节点
    }
}
```

```python
class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        pre, cur = None, head  # pre指向前一个节点，cur指向当前节点
        while cur:
            nxt = cur.next  # 暂存下一个节点，防止断链
            cur.next = pre  # 反转指针方向
            pre = cur       # pre前进
            cur = nxt       # cur前进
        return pre  # pre最终指向反转后的头节点
```

---

### 24. 回文链表（简单）

**题目描述：** 判断链表是否为回文。

**解题思路：** 快慢指针找到中点，反转后半部分链表，然后比较前后两半。O(n) 时间，O(1) 空间。

**记忆点：**
- **口诀**：快慢找中点，反转后半，双头比较
- **模板**：快慢指针 + 反转链表
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：比较时以反转后的后半段 `r` 为循环条件（后半段短），别用原 head

**示例：**
> 输入：head = [1,2,2,1]
> 输出：true

```java
class Solution {
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        // ★ 反转后半部分
        ListNode pre = null;
        while (slow != null) {
            ListNode next = slow.next;
            slow.next = pre;
            pre = slow;
            slow = next;
        }
        // 比较
        ListNode l = head, r = pre;
        while (r != null) {
            if (l.val != r.val) return false;
            l = l.next;
            r = r.next;
        }
        return true;
    }
}
```

```python
class Solution:
    def isPalindrome(self, head: ListNode) -> bool:
        slow = fast = head
        # 快慢指针找中点：fast走两步，slow走一步
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        # 反转后半部分链表
        pre = None
        while slow:
            nxt = slow.next
            slow.next = pre
            pre = slow
            slow = nxt
        # 比较前后两半是否相同
        l, r = head, pre
        while r:
            if l.val != r.val:
                return False
            l = l.next
            r = r.next
        return True
```

---

### 25. 环形链表（简单）

**题目描述：** 判断链表是否有环。

**解题思路：** 快慢指针（Floyd 判圈）。快指针每次 2 步，慢指针每次 1 步。相遇则有环，fast 走到 null 则无环。

**记忆点：**
- **口诀**：慢一步快两步，相遇即有环
- **模板**：快慢指针（Floyd 判圈）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：循环条件 `fast != null && fast.next != null`，先判 fast 再判 fast.next，否则空指针

**示例：**
> 输入：head = [3,2,0,-4], pos = 1
> 输出：true

```java
public class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;       // 慢指针每次走1步
            fast = fast.next.next;  // 快指针每次走2步（Floyd判圈法）
            if (slow == fast) return true; // ★ 相遇则有环
        }
        return false;
    }
}
```

```python
class Solution:
    def hasCycle(self, head: ListNode) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next       # 慢指针每次走1步
            fast = fast.next.next  # 快指针每次走2步（Floyd判圈法）
            if slow == fast:
                return True  # 相遇则有环
        return False
```

---

### 26. 环形链表 II（中等）

**题目描述：** 找出链表环的入口节点。

**解题思路：** 先用快慢指针找到相遇点，然后一个指针从头、一个从相遇点，每次各一步，相遇处即为环入口。

**记忆点：**
- **口诀**：先相遇，再同速走，二次相遇是入口
- **模板**：快慢指针（Floyd 判圈）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：第二次要让「头节点」和「相遇点」同时各走一步，不是继续用 fast 走两步

**示例：**
> 输入：head = [3,2,0,-4], pos = 1
> 输出：返回索引为1的节点

```java
public class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode slow = head, fast = head;
        // 阶段一：快慢指针找相遇点（Floyd 判圈，有环则必然相遇）
        while (fast != null && fast.next != null) {
            slow = slow.next;       // 慢指针一次一步
            fast = fast.next.next;  // 快指针一次两步
            if (slow == fast) {       // 相遇：确认有环，slow 停在环内某点
                // 阶段二：由 Floyd 判圈的数学性质——
                // 「头节点到环入口的距离」=「相遇点绕回环入口的距离」+ 若干整圈
                // 所以头节点与相遇点同时各走一步，必然在环入口再次相遇
                ListNode p = head;    // 一个指针从头开始
                while (p != slow) {   // 与相遇点指针同步前进
                    p = p.next;
                    slow = slow.next;
                }
                return p; // ★ 再次相遇处即为环入口
            }
        }
        return null; // fast 走到尽头，说明无环
    }
}
```

```python
class Solution:
    def detectCycle(self, head: ListNode) -> ListNode:
        slow = fast = head
        # 阶段一：快慢指针找相遇点（有环则必然相遇）
        while fast and fast.next:
            slow = slow.next      # 慢指针一步
            fast = fast.next.next # 快指针两步
            if slow == fast:      # 相遇：确认有环
                # 阶段二：头节点与相遇点同时各走一步，再相遇处即环入口
                p = head
                while p != slow:
                    p = p.next
                    slow = slow.next
                return p  # 环入口
        return None  # 无环
```

---

### 27. 合并两个有序链表（简单）

**题目描述：** 合并两个升序链表为一个升序链表。

**解题思路：** 递归或迭代。迭代法用 dummy 节点，每次取两个头部较小者接在结果链表后。O(m+n)。

**记忆点：**
- **口诀**：dummy 开头，谁小接谁
- **模板**：链表操作（模式 6）
- **复杂度**：O(m+n) 时间 / O(1) 空间
- **坑**：记得 `cur = cur.next` 推进结果指针；结尾接上剩余链表

**示例：**
> 输入：l1 = [1,2,4], l2 = [1,3,4]
> 输出：[1,1,2,3,4,4]

```java
class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(-1), cur = dummy; // dummy简化空链表边界处理
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) { // ★ 谁小接谁
                cur.next = l1;
                l1 = l1.next;
            } else {
                cur.next = l2;
                l2 = l2.next;
            }
            cur = cur.next;
        }
        cur.next = l1 != null ? l1 : l2; // 接上剩余部分
        return dummy.next;
    }
}
```

```python
class Solution:
    def mergeTwoLists(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = cur = ListNode(-1)  # dummy简化空链表边界处理
        while l1 and l2:
            if l1.val <= l2.val:
                cur.next = l1
                l1 = l1.next
            else:
                cur.next = l2
                l2 = l2.next
            cur = cur.next
        cur.next = l1 or l2  # 接上剩余部分
        return dummy.next
```

---

### 28. 两数相加（中等）

**题目描述：** 两个非空链表表示逆序存储的数字，相加返回新链表。

**解题思路：** 模拟加法竖式，维护进位 `carry`。每位和 = l1.val + l2.val + carry，新节点存 %10，carry = /10。处理完所有节点和进位后结束。

**记忆点：**
- **口诀**：模拟竖式，余数存结点，商存进位
- **模板**：链表操作（模式 6）
- **复杂度**：O(max(m,n)) 时间 / O(1) 空间
- **坑**：循环条件要含 `carry != 0`，否则漏掉最高位进位（如 5+5=10 会少个 1）

**示例：**
> 输入：l1 = [2,4,3], l2 = [5,6,4]
> 输出：[7,0,8] （342 + 465 = 807）

```java
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(-1), cur = dummy; // dummy 承接结果链表
        int carry = 0; // 进位（0 或 1）
        // 三个条件缺一不可：两条链表任一还有节点，或进位还没处理完
        // 少了 carry!=0 会漏掉最高位进位（如 5+5=10，结果应为 1->0，缺进位只剩 0）
        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry; // 先带上一步的进位
            if (l1 != null) { sum += l1.val; l1 = l1.next; } // 取 l1 当前位并前进
            if (l2 != null) { sum += l2.val; l2 = l2.next; } // 取 l2 当前位并前进
            cur.next = new ListNode(sum % 10); // 当前位 = sum 的个位
            carry = sum / 10;                   // ★ 进位 = sum 的十位
            cur = cur.next;
        }
        return dummy.next;
    }
}
```

```python
class Solution:
    def addTwoNumbers(self, l1: ListNode, l2: ListNode) -> ListNode:
        dummy = cur = ListNode(-1)  # dummy 承接结果链表
        carry = 0  # 进位
        # l1/l2 任一还有节点，或进位未处理完都要继续（防漏最高位进位）
        while l1 or l2 or carry:
            total = carry  # 先带上一步进位
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next
            cur.next = ListNode(total % 10)  # 当前位 = 个位
            carry = total // 10              # 进位 = 十位
            cur = cur.next
        return dummy.next
```

---

### 29. 删除链表的倒数第 N 个结点（中等）

**题目描述：** 删除链表倒数第 n 个结点。

**解题思路：** 快慢指针。fast 先走 n+1 步（或 n 步配合 dummy），然后 slow 和 fast 同速移动。fast 到尾部时 slow 指向倒数第 n 个的前驱，删除即可。

**记忆点：**
- **口诀**：fast 先走 n+1，slow 再同速跟
- **模板**：双指针（快慢）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：用 dummy 头 + fast 先走 `n+1` 步，slow 才能停在「待删结点的前驱」而非待删结点本身

**示例：**
> 输入：head = [1,2,3,4,5], n = 2
> 输出：[1,2,3,5]

```java
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(-1, head); // 哨兵：删除头节点时无需特判
        ListNode fast = dummy, slow = dummy;
        // fast 先走 n+1 步：这样当 fast 走到链表尾部(null)时，
        // slow 恰好停在「倒数第 n 个节点」的前驱位置，便于删除
        for (int i = 0; i <= n; i++) fast = fast.next;
        // 双指针同速前进，直到 fast 到达 null
        while (fast != null) {
            slow = slow.next;
            fast = fast.next;
        }
        // slow.next 就是待删节点，让 slow 直接跳过它即可
        slow.next = slow.next.next; // ★ 跳过倒数第 N 个
        return dummy.next;
    }
}
```

```python
class Solution:
    def removeNthFromEnd(self, head: ListNode, n: int) -> ListNode:
        dummy = ListNode(-1, head)  # 哨兵，简化删除头节点的情况
        fast = slow = dummy
        # fast 先走 n+1 步，让 slow 最终停在待删节点的前驱
        for _ in range(n + 1):
            fast = fast.next
        # 双指针同速前进，fast 到 null 时 slow 恰好在前驱位置
        while fast:
            slow = slow.next
            fast = fast.next
        slow.next = slow.next.next  # 跳过待删节点
        return dummy.next
```

---

### 30. 两两交换链表中的节点（中等）

**题目描述：** 两两交换链表中相邻节点，不修改节点值。

**解题思路：** 递归或迭代。迭代法：用 dummy 节点，每次处理两个节点。注意修改指针顺序。

**记忆点：**
- **口诀**：a 接 b 后，b 指回 a，pre 接 b
- **模板**：链表操作（模式 6）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：指针顺序必须 `a.next=b.next → b.next=a → pre.next=b`，先动 pre.next 会断链

**示例：**
> 输入：head = [1,2,3,4]
> 输出：[2,1,4,3]

```java
class Solution {
    public ListNode swapPairs(ListNode head) {
        ListNode dummy = new ListNode(-1, head), pre = dummy; // pre 指向已处理部分的尾部
        // 还有至少两个未处理的节点才继续交换
        while (pre.next != null && pre.next.next != null) {
            ListNode a = pre.next, b = a.next; // a、b 是要交换的两个相邻节点
            // 重连顺序至关重要（可画图理解）：
            // ① a 先接住 b 的后继（暂存后链，避免丢失）
            // ② b 回指 a（完成 a、b 反向）
            // ③ pre 接住 b（把交换后的头连到已处理部分）
            a.next = b.next; // ★ 三连：断 a→b，b 回指 a，pre 接 b
            b.next = a;
            pre.next = b;
            pre = a; // pre 前进到已交换对的尾部，准备处理下一对
        }
        return dummy.next;
    }
}
```

```python
class Solution:
    def swapPairs(self, head: ListNode) -> ListNode:
        dummy = pre = ListNode(-1, head)  # pre 指向已处理部分尾部
        while pre.next and pre.next.next:  # 还有至少两个节点
            a, b = pre.next, pre.next.next  # 待交换的两个相邻节点
            # 重连顺序：a 接 b 的后继 → b 回指 a → pre 接 b
            a.next = b.next
            b.next = a
            pre.next = b
            pre = a  # pre 前进，处理下一对
        return dummy.next
```

---

### 32. 随机链表的复制（中等）

**题目描述：** 复制含有 next 和 random 指针的链表。

**解题思路：** 哈希表法。第一遍遍历创建所有新节点，建立 原节点→新节点 的映射。第二遍遍历根据映射设置新节点的 next 和 random。O(n) 时间，O(n) 空间。

**记忆点：**
- **口诀**：先建映射，再连 next 和 random
- **模板**：哈希表（模式 1）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：两遍遍历分离——第一遍只建节点存 map，第二遍才连指针，因为 random 可能指向还没创建的节点

**示例：**
> 输入：head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
> 输出：[[7,null],[13,0],[11,4],[10,2],[1,0]]

```java
class Solution {
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        Map<Node, Node> map = new HashMap<>(); // 原节点 → 新节点的映射
        // 第一遍：创建所有新节点，建立 原节点→新节点 的映射（key为旧节点引用）
        for (Node cur = head; cur != null; cur = cur.next) {
            map.put(cur, new Node(cur.val));
        }
        // 第二遍：利用映射为每个新节点设置next和random指针
        // map.get(cur.next) 通过旧next找到对应的新next，random同理
        for (Node cur = head; cur != null; cur = cur.next) {
            map.get(cur).next = map.get(cur.next); // ★ 用映射连指针
            map.get(cur).random = map.get(cur.random);
        }
        return map.get(head);
    }
}
```

```python
class Solution:
    def copyRandomList(self, head: 'Node') -> 'Node':
        if not head: return None
        mapping = {}
        cur = head
        while cur:
            mapping[cur] = Node(cur.val)  # 建立 原节点→新节点 的映射
            cur = cur.next
        cur = head
        while cur:
            # 通过旧节点的next/random找到对应的新节点
            mapping[cur].next = mapping.get(cur.next)
            mapping[cur].random = mapping.get(cur.random)
            cur = cur.next
        return mapping[head]
```

---

### 33. 排序链表（中等）

**题目描述：** 对链表进行排序，要求 O(nlogn) 时间，O(1) 空间。

**解题思路：** 自底向上归并排序。先计算链表长度，按 step=1,2,4,... 分组合并。每次合并两个有序子链表。O(nlogn) 时间，O(1) 空间。

**记忆点：**
- **口诀**：快慢找中点，递归排两半，再归并
- **模板**：归并排序 + 链表操作
- **复杂度**：O(nlogn) 时间 / O(logn) 空间（递归栈）
- **坑**：下方代码是「自顶向下」递归版（空间 O(logn)）；要找中点时 `fast` 从 `head.next` 起步，否则两节点会无限递归

**示例：**
> 输入：head = [4,2,1,3]
> 输出：[1,2,3,4]

```java
class Solution {
    public ListNode sortList(ListNode head) {
        // 归并排序：先二分再合并，链表中点用快慢指针找（数组则用下标）
        if (head == null || head.next == null) return head; // 空或单节点天然有序
        // 快慢指针找中点：fast 必须从 head.next 起步，否则只有两个节点时会无限递归
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        ListNode mid = slow.next; // ★ 快慢找中点，断链
        slow.next = null;         // 从中间断开，分成两半
        // 递归排序左右两半
        ListNode left = sortList(head);
        ListNode right = sortList(mid);
        // 合并两个有序链表（同题 27）
        return merge(left, right);
    }
    // 合并两个升序链表
    private ListNode merge(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(-1), cur = dummy;
        while (l1 != null && l2 != null) {
            if (l1.val <= l2.val) { cur.next = l1; l1 = l1.next; }
            else { cur.next = l2; l2 = l2.next; }
            cur = cur.next;
        }
        cur.next = l1 != null ? l1 : l2; // 接上剩余部分
        return dummy.next;
    }
}
```

```python
class Solution:
    def sortList(self, head: ListNode) -> ListNode:
        # 归并排序：递归二分 + 合并有序链表
        if not head or not head.next: return head  # 空或单节点
        # 快慢指针找中点（fast 从 head.next 起步，避免两节点死循环）
        slow, fast = head, head.next
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        mid = slow.next  # 右半起点
        slow.next = None  # 断链分成两半
        # 递归排序左右并合并
        left = self.sortList(head)
        right = self.sortList(mid)
        return self.merge(left, right)

    def merge(self, l1, l2):
        """合并两个升序链表"""
        dummy = cur = ListNode(-1)
        while l1 and l2:
            if l1.val <= l2.val:
                cur.next = l1; l1 = l1.next
            else:
                cur.next = l2; l2 = l2.next
            cur = cur.next
        cur.next = l1 or l2  # 接上剩余
        return dummy.next
```

---

### 35. LRU 缓存（中等）

**题目描述：** 实现 LRU（最近最少使用）缓存，支持 get 和 put 操作，O(1) 时间。

**解题思路：** 哈希表 + 双向链表。哈希表实现 O(1) 查找，双向链表维护访问顺序。访问/插入时将节点移到链表头部，容量满时删除链表尾部节点。

**记忆点：**
- **口诀**：哈希查得快，链表管顺序，头新尾旧
- **模板**：哈希表 + 双向链表
- **复杂度**：get/put 均 O(1)
- **坑**：用 head/tail 两个哨兵节点省去判空；Node 里必须存 key，否则删除尾节点时无法从 map 移除

**示例：**
> 输入：["LRUCache","put","put","get","put","get","put","get","get","get"] , [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]
> 输出：[null,null,null,1,null,-1,null,-1,3,4]

```java
class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    Map<Integer, Node> map = new HashMap<>();
    // head/tail 是哨兵节点（dummy），避免处理首尾空指针，简化边界操作
    Node head = new Node(-1, -1), tail = new Node(-1, -1);
    int cap;

    public LRUCache(int capacity) {
        cap = capacity;
        head.next = tail;  // 初始化为空链表：head <-> tail
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        moveToHead(node);  // ★ 访问后移到头部
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            map.get(key).val = value;
            moveToHead(map.get(key));
        } else {
            if (map.size() == cap) {
                Node last = tail.prev; // tail.prev 才是真正的尾节点（tail是哨兵）
                removeNode(last);
                map.remove(last.key);  // 注意要删map中的key，node中存key就是为了这一步
            }
            Node node = new Node(key, value);
            map.put(key, node);
            addToHead(node);
        }
    }

    void moveToHead(Node node) { removeNode(node); addToHead(node); }
    // 从双向链表中摘除node，前后节点直接相连
    void removeNode(Node node) { node.prev.next = node.next; node.next.prev = node.prev; }
    // 将node插入到head之后：head <-> node <-> 原head.next
    void addToHead(Node node) {
        node.next = head.next;  // node.next指向原第一个真实节点
        node.prev = head;
        head.next.prev = node;  // 原第一个真实节点的prev回指node
        head.next = node;       // head.next指向新节点
    }
}
```

```python
class LRUCache:
    class Node:
        def __init__(self, k, v):
            self.key = k
            self.val = v
            self.prev = self.next = None

    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        # head/tail 是哨兵节点，避免处理首尾空指针，简化边界操作
        self.head = self.Node(-1, -1)
        self.tail = self.Node(-1, -1)
        self.head.next = self.tail  # 初始化为空链表：head <-> tail
        self.tail.prev = self.head

    def _remove(self, node):
        """从双向链表中摘除node，前后节点直接相连"""
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_head(self, node):
        """将node插入到head之后：head <-> node <-> 原head.next"""
        node.next = self.head.next  # node.next指向原第一个真实节点
        node.prev = self.head
        self.head.next.prev = node  # 原第一个真实节点的prev回指node
        self.head.next = node       # head.next指向新节点

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_head(node)  # 访问后移到头部，表示最近使用
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
            self.cache[key].val = value
            self._add_to_head(self.cache[key])
        else:
            if len(self.cache) == self.cap:
                last = self.tail.prev  # tail.prev才是真正的尾节点（tail是哨兵）
                self._remove(last)
                del self.cache[last.key]  # node中存key就是为了这里能删map中的条目
            node = self.Node(key, value)
            self.cache[key] = node
            self._add_to_head(node)
```

---

## 八、二叉树

### 36. 二叉树的中序遍历（简单）

**题目描述：** 返回二叉树的中序遍历结果。

**解题思路：** 栈模拟递归。不断将左子节点入栈，然后弹出访问，再转向右子节点。O(n)。

**记忆点：**
- **口诀**：一路向左入栈，弹栈访问，转向右
- **模板**：二叉树遍历（中序栈）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：外层循环条件 `cur != null || !stack.isEmpty()`，两个条件缺一不可

**示例：**
> 输入：root = [1,null,2,3]
> 输出：[1,3,2]

```java
class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        TreeNode cur = root;
        while (cur != null || !stack.isEmpty()) {
            // 一路向左，将所有左子节点入栈
            while (cur != null) {
                stack.push(cur);
                cur = cur.left;
            }
            cur = stack.pop(); // ★ 弹出栈顶访问（此时左子树已处理完）
            res.add(cur.val);
            cur = cur.right;   // 转向右子树
        }
        return res;
    }
}
```

```python
class Solution:
    def inorderTraversal(self, root: TreeNode) -> List[int]:
        res, stack = [], []
        cur = root
        while cur or stack:
            # 一路向左，将所有左子节点入栈
            while cur:
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()  # 弹出栈顶访问（此时左子树已处理完）
            res.append(cur.val)
            cur = cur.right    # 转向右子树
        return res
```

---

### 37. 二叉树的最大深度（简单）

**题目描述：** 求二叉树的最大深度。

**解题思路：** 递归：`maxDepth(root) = 1 + max(maxDepth(left), maxDepth(right))`。空节点深度为 0。

**记忆点：**
- **口诀**：深度 = 1 + 左右较深者
- **模板**：二叉树递归（模式 7）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：空节点返回 0，是递归终止条件，漏了会空指针

**示例：**
> 输入：root = [3,9,20,null,null,15,7]
> 输出：3

```java
class Solution {
    public int maxDepth(TreeNode root) {
        if (root == null) return 0; // 空节点深度为0
        // 当前深度 = 1 + 左右子树中较深的深度
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right)); // ★ 深度 = 1 + 较深侧
    }
}
```

```python
class Solution:
    def maxDepth(self, root: TreeNode) -> int:
        if not root: return 0  # 空节点深度为0
        # 当前深度 = 1 + 左右子树中较深的深度
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
```

---

### 38. 翻转二叉树（简单）

**题目描述：** 翻转二叉树（左右子树互换）。

**解题思路：** 递归：交换当前节点的左右子树，然后分别翻转左右子树。

**记忆点：**
- **口诀**：换左右，再递归两子树
- **模板**：二叉树递归（模式 7）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：先交换再递归（顺序其实无所谓），但交换后递归传的左右要对

**示例：**
> 输入：root = [4,2,7,1,3,6,9]
> 输出：[4,7,2,9,6,3,1]

```java
class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        // 交换左右子节点，然后递归翻转子树
        TreeNode tmp = root.left; // ★ 交换左右
        root.left = root.right;
        root.right = tmp;
        invertTree(root.left);
        invertTree(root.right);
        return root;
    }
}
```

```python
class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        if not root: return None
        # 交换左右子节点
        root.left, root.right = root.right, root.left
        # 递归翻转子树
        self.invertTree(root.left)
        self.invertTree(root.right)
        return root
```

---

### 39. 对称二叉树（简单）

**题目描述：** 判断二叉树是否镜像对称。

**解题思路：** 递归比较左右子树：`isMirror(l, r)` 检查 `l.val == r.val` 且 `l.left` 与 `r.right` 对称、`l.right` 与 `r.left` 对称。

**记忆点：**
- **口诀**：值相等，左对右、右对左交叉比
- **模板**：二叉树递归（模式 7）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：比较的是 `l.left ↔ r.right`、`l.right ↔ r.left`（交叉），不是同侧

**示例：**
> 输入：root = [1,2,2,3,4,4,3]
> 输出：true

```java
class Solution {
    public boolean isSymmetric(TreeNode root) {
        return isMirror(root.left, root.right);
    }
    boolean isMirror(TreeNode l, TreeNode r) {
        if (l == null && r == null) return true;
        if (l == null || r == null) return false;
        // 判断以 l 为根的左子树和以 r 为根的右子树是否互为镜像。
        return l.val == r.val && isMirror(l.left, r.right) && isMirror(l.right, r.left); // ★ 交叉比较
    }
}
```

```python
class Solution:
    def isSymmetric(self, root: TreeNode) -> bool:
        def isMirror(l, r):
            if not l and not r: return True
            if not l or not r: return False
            # 值相等且交叉比较：l的左对r的右，l的右对r的左
            return l.val == r.val and isMirror(l.left, r.right) and isMirror(l.right, r.left)
        return isMirror(root.left, root.right)
```

---

### 40. 二叉树的直径（简单）

**题目描述：** 求二叉树直径（任意两节点间的最长路径，可能不经过根节点）。

**解题思路：** DFS 递归。对于每个节点，计算左右子树深度，`直径 = max(直径, 左深度 + 右深度)`。返回较深一侧深度 + 1。O(n)。

**记忆点：**
- **口诀**：深度照常返，直径顺路算（左深+右深）
- **模板**：二叉树递归（DFS）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：直径可能不经过根节点，所以要用全局变量在递归中更新，不能只在根算

**示例：**
> 输入：root = [1,2,3,4,5]
> 输出：3 （路径 [4,2,1,3] 或 [5,2,1,3]）

```java
class Solution {
    int diameter = 0;
    public int diameterOfBinaryTree(TreeNode root) {
        depth(root);
        return diameter;
    }
    int depth(TreeNode node) {
        if (node == null) return 0;
        int l = depth(node.left), r = depth(node.right);
        // 当前节点的直径候选值 = 左深度 + 右深度
        diameter = Math.max(diameter, l + r); // ★ 直径候选 = 左深 + 右深
        // 返回以当前节点为根的深度（选较长的一侧）
        return 1 + Math.max(l, r);
    }
}
```

```python
class Solution:
    def diameterOfBinaryTree(self, root: TreeNode) -> int:
        self.diameter = 0
        def depth(node):
            if not node: return 0
            l, r = depth(node.left), depth(node.right)
            # 当前节点的直径候选值 = 左深度 + 右深度
            self.diameter = max(self.diameter, l + r)
            # 返回以当前节点为根的深度（选较长的一侧）
            return 1 + max(l, r)
        depth(root)
        return self.diameter
```

---

### 41. 二叉树的层序遍历（中等）

**题目描述：** 返回二叉树逐层遍历的结果。

**解题思路：** BFS 队列。每次处理当前层所有节点（记录当前队列长度 `levelSize`），将值加入当前层列表。

**记忆点：**
- **口诀**：队列按层来，size 定一层的边界
- **模板**：BFS（模式 8）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：先取 `size = q.size()` 再循环，循环内队列会变长，不能把 `q.size()` 写进循环条件

**示例：**
> 输入：root = [3,9,20,null,null,15,7]
> 输出：[[3],[9,20],[15,7]]

```java
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>(); // BFS 队列
        q.offer(root);
        while (!q.isEmpty()) {
            // 关键：先记录当前队列长度 = 当前层的节点数
            // 循环中会不断入队下一层节点，只有固定 size 才能保证只处理本层
            int size = q.size(); // ★ 当前层节点数，按层分组
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) { // 只处理当前层的 size 个节点
                TreeNode node = q.poll();
                level.add(node.val);
                if (node.left != null) q.offer(node.left);   // 下一层节点入队
                if (node.right != null) q.offer(node.right);
            }
            res.add(level);
        }
        return res;
    }
}
```

```python
class Solution:
    def levelOrder(self, root: TreeNode) -> List[List[int]]:
        if not root: return []
        res, q = [], collections.deque([root])  # BFS 队列
        while q:
            level = []
            # 按当前队列长度（即当前层节点数）分组处理；
            # len(q) 在 range 时已固定，循环内加入的下一层节点不会影响本次
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left: q.append(node.left)
                if node.right: q.append(node.right)
            res.append(level)
        return res
```

---

### 42. 将有序数组转换为二叉搜索树（简单）

**题目描述：** 将升序数组转换为平衡二叉搜索树。

**解题思路：** 二分递归。取中间元素为根，左半边递归构建左子树，右半边递归构建右子树。

**记忆点：**
- **口诀**：取中点做根，左半建左树，右半建右树
- **模板**：二分 + 递归
- **复杂度**：O(n) 时间 / O(logn) 空间
- **坑**：递归终止条件 `l > r` 返回 null，不是 `l >= r`（后者会漏掉单节点情况）

**示例：**

> 输入：nums = [-10,-3,0,5,9]
> 输出：[0,-3,9,-10,null,5] 或 [0,-10,5,null,-3,null,9]

```java
class Solution {
    public TreeNode sortedArrayToBST(int[] nums) {
        return build(nums, 0, nums.length - 1);
    }
    TreeNode build(int[] nums, int l, int r) {
        if (l > r) return null; // 递归终止条件 — 防止无限递归
        int mid = (l + r) / 2;          // ★ 取中点做根
        TreeNode root = new TreeNode(nums[mid]);
        root.left = build(nums, l, mid - 1);   // 左半边递归构建左子树
        root.right = build(nums, mid + 1, r);  // 右半边递归构建右子树
        return root;
    }
}
```

```python
class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> TreeNode:
        def build(l, r):
            if l > r: return None
            mid = (l + r) // 2               # 取中间元素为根，保证平衡
            root = TreeNode(nums[mid])
            root.left = build(l, mid - 1)    # 左半边递归构建左子树
            root.right = build(mid + 1, r)   # 右半边递归构建右子树
            return root
        return build(0, len(nums) - 1)
```

---

### 43. 验证二叉搜索树（中等）

**题目描述：** 判断二叉树是否是有效的 BST。

**有效** 二叉搜索树定义如下：

- 节点的左子树只包含 **严格小于** 当前节点的数。
- 节点的右子树只包含 **严格大于** 当前节点的数。
- 所有左子树和右子树自身必须也是二叉搜索树。

**解题思路：** 递归，携带当前节点的值范围 `(min, max)`。左子树值 < root.val，右子树值 > root.val。使用 long 类型边界处理 Integer 极值。

**记忆点：**
- **口诀**：带区间递归，左收紧上界，右收紧下界
- **模板**：二叉树递归（模式 7）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：不能只比较「左 < 根 < 右」，必须传范围保证整棵子树都在区间内；边界用 Long 防极值

**示例：**

> 输入：root = [2,1,3]
> 输出：true

```java
class Solution {
    public boolean isValidBST(TreeNode root) {
        // 用 Long 边界：节点值可能是 Integer.MIN_VALUE / MAX_VALUE，
        // 直接用它当边界会把「等于极值」的节点误判
        return validate(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }
    // 递归校验 node 是否满足 min < node.val < max
    boolean validate(TreeNode node, long min, long max) {
        if (node == null) return true; // 空子树天然合法
        if (node.val <= min || node.val >= max) return false; // 不在合法范围内
        // 进入左子树时上界收紧为 node.val（左子树所有值必须 < 根）
        // 进入右子树时下界收紧为 node.val（右子树所有值必须 > 根）
        // 关键：必须传范围，而不是只比较「左 < 根 < 右」，
        // 否则下面的子树可能越过祖先节点的边界（如 5 的右子树的左子树里出现 3）
        return validate(node.left, min, node.val) && validate(node.right, node.val, max); // ★ 收紧区间递归
    }
}
```

```python
class Solution:
    def isValidBST(self, root: TreeNode) -> bool:
        def validate(node, lo, hi):
            if not node: return True
            if not (lo < node.val < hi): return False  # 不在合法范围
            # 左子树收紧上界，右子树收紧下界（保证整棵子树都在区间内）
            return validate(node.left, lo, node.val) and validate(node.right, node.val, hi)
        # 用 float 极值处理边界
        return validate(root, float('-inf'), float('inf'))
```

---

### 44. 二叉搜索树中第 K 小的元素（中等）

**题目描述：** 找出 BST 中第 k 小的元素。

**解题思路：** 中序遍历有序。中序遍历到第 k 个节点时记录结果。使用计数器。

**记忆点：**
- **口诀**：中序遍历升序，数到第 k 个停下
- **模板**：二叉树中序遍历
- **复杂度**：O(k) 时间 / O(n) 空间
- **坑**：BST 中序遍历天然升序；计数器放在「访问根」位置（左递归之后），不是左递归之前

**示例：**

> 输入：root = [3,1,4,null,2], k = 1
> 输出：1

```java
class Solution {
    int count = 0, res = 0; // count 记录已访问节点数
    public int kthSmallest(TreeNode root, int k) {
        inorder(root, k);
        return res;
    }
    // 利用 BST 性质：中序遍历结果就是升序序列
    void inorder(TreeNode node, int k) {
        if (node == null) return;
        inorder(node.left, k); // 先一路向左：最左节点是整棵树最小值
        count++;               // ★ 中序升序，第 k 个即第 k 小
        if (count == k) { res = node.val; return; } // 数到第 k 个，记录并剪枝返回
        inorder(node.right, k);
    }
}
```

```python
class Solution:
    def kthSmallest(self, root: TreeNode, k: int) -> int:
        self.count, self.res = 0, 0
        def inorder(node):
            if not node: return
            inorder(node.left)  # 先访问左子树（最小值）
            self.count += 1     # 中序升序，第 k 个访问的即第 k 小
            if self.count == k:
                self.res = node.val
                return
            inorder(node.right)
        inorder(root)
        return self.res
```

---

### 45. 二叉树的右视图（中等）

**题目描述：** 返回从右侧看到的节点值（每层最右边的节点）。

**解题思路：** 层序遍历（BFS），利用队列，从左到右入队，每层取最后一个节点值。或 DFS 先右后左，记录每层第一个访问到的节点。

**记忆点：**
- **口诀**：层序每层取最后一个
- **模板**：BFS 层序遍历
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：`i == size-1` 时才是每层最右节点；先入左再入右，最后出队的就是最右

**示例：**

> 输入：root = [1,2,3,null,5,null,4]
> 输出：[1,3,4]
>
> ![](https://assets.leetcode.com/uploads/2024/11/24/tmpd5jn43fs-1.png)
>
>

```java
class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size(); // 当前层节点数
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                // 关键：先入左再入右，同一层出队顺序是 左→右，
                // 每层「最后一个出队」的就是最右节点（右视图能看到它）
                if (i == size - 1) res.add(node.val); // ★ 每层最后一个即最右
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
        }
        return res;
    }
}
```

```python
class Solution:
    def rightSideView(self, root: TreeNode) -> List[int]:
        if not root: return []
        res, q = [], collections.deque([root])
        while q:
            size = len(q)  # 当前层节点数
            for i in range(size):
                node = q.popleft()
                # 先入左再入右，每层最后出队的即最右节点
                if i == size - 1: res.append(node.val)
                if node.left: q.append(node.left)
                if node.right: q.append(node.right)
        return res
```

---

### 46. 二叉树展开为链表（中等）

**题目描述：** 将二叉树按先序遍历展开为单链表（右指针为 right，而左子指针始终为 null 。）。

**解题思路：** 对于每个节点，将左子树整体移到右子树位置，原右子树接到左子树的最右节点后面。

**记忆点：**
- **口诀**：左树挪右边，原右挂到左树最右
- **模板**：二叉树迭代
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：先找左子树最右节点（前驱），把原右子树挂过去，再整体右移，顺序不能乱

前序遍历顺序：**根 →左 →右** 对于当前`cur`节点：

1. 如果**没有左子树**：直接往右走`cur = cur.right`，不用处理。
2. 如果有左子树：
   - 左子树要挪到右边；
   - 那原来的**右子树放哪里？** → 放到【左子树的最右边结点】的右孩子上。 因为前序遍历，左子树全部遍历完之后，才轮到原来的右子树。

**示例：**
> 输入：root = [1,2,5,3,4,null,6]
> 输出：[1,null,2,null,3,null,4,null,5,null,6]

```java
class Solution {
    public void flatten(TreeNode root) {
        TreeNode cur = root;
        while (cur != null) {
            if (cur.left != null) {
                // 前序遍历顺序是 根 → 左 → 右：
                // 要把左子树整体搬到右边，就得先找到「左子树的最右节点」（前驱），
                // 把原来的右子树挂到它后面（等左子树全部走完才轮到原右子树）
                TreeNode rightmost = cur.left;
                while (rightmost.right != null) rightmost = rightmost.right;
                rightmost.right = cur.right; // ★ 原右子树挂到左树最右
                cur.right = cur.left;        // 左子树整体移到右边
                cur.left = null;             // 左子树置空（题设要求 left 恒为 null）
            }
            // 继续处理下一个节点（此时已无左子树，直接往右走）
            cur = cur.right;
        }
    }
}
```

```python
class Solution:
    def flatten(self, root: TreeNode) -> None:
        cur = root
        while cur:
            if cur.left:
                # 前序 根→左→右：先找左子树最右节点作为前驱
                rightmost = cur.left
                while rightmost.right:
                    rightmost = rightmost.right
                rightmost.right = cur.right  # 原右子树挂到左子树最右节点后
                cur.right = cur.left         # 左子树整体移到右边
                cur.left = None              # left 置空
            cur = cur.right
```

---

### 47. 从前序与中序遍历序列构造二叉树（中等）

**题目描述：** 根据前序和中序遍历构造二叉树。

**解题思路：** 前序第一个是根节点，在中序中找到根的位置，左边是左子树，右边是右子树。递归构建。

**记忆点：**
- **口诀**：前序定根，中序分左右，递归建
- **模板**：递归 + 哈希索引
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：`preIdx` 必须是全局变量（跨递归自增），不能当参数传；中序用 HashMap 存值→下标加速查找

**示例：**
> 输入：preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]
> 输出：[3,9,20,null,null,15,7]

```java
class Solution {
    // 中序「值 → 下标」映射：快速定位根在中序中的位置，从而切分左右子树区间
    Map<Integer, Integer> inMap = new HashMap<>();
    // preIdx 必须是类成员：前序遍历顺序 = 构建顺序，每建一个根 preIdx++，
    // 且递归「先左后右」时指针必须跨递归同步递增，传参做不到
    int preIdx = 0;

    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) inMap.put(inorder[i], i);
        return build(preorder, 0, inorder.length - 1);
    }
    // 用「中序区间 [l, r]」构建当前子树
    TreeNode build(int[] preorder, int l, int r) {
        // l > r：区间为空（该侧子树不存在），递归终止返回 null
        if (l > r) return null;
        int val = preorder[preIdx++]; // ★ 前序第一个是根（前序从左到右逐个取）
        TreeNode root = new TreeNode(val);
        int idx = inMap.get(val);             // 根在中序中的位置
        root.left = build(preorder, l, idx - 1);   // 中序根的左边 = 左子树区间
        root.right = build(preorder, idx + 1, r);  // 中序根的右边 = 右子树区间
        return root;
    }
}
```

```python
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> TreeNode:
        self.in_map = {v: i for i, v in enumerate(inorder)}  # 中序值→下标
        self.pre_idx = 0  # 前序指针（成员变量，跨递归自增）
        def build(l, r):
            if l > r: return None  # 区间空，返回 null
            val = preorder[self.pre_idx]
            self.pre_idx += 1
            root = TreeNode(val)
            idx = self.in_map[val]  # 根在中序中的位置，切分左右子树
            root.left = build(l, idx - 1)
            root.right = build(idx + 1, r)
            return root
        return build(0, len(inorder) - 1)
```

---

### 48. 路径总和 III（中等）

**题目描述：** 找出二叉树中路径和等于 targetSum 的路径数量（路径方向必须向下）。

**解题思路：** 前缀和 + 哈希表（类似"和为 K 的子数组"）。DFS 维护根到当前节点的路径和，查找是否有历史前缀和等于 `curSum - targetSum`。注意回溯时移除当前前缀和。

**记忆点：**
- **口诀**：前缀和搬到树上，回溯记得撤销
- **模板**：前缀和 + DFS（模式 4）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：递归返回前必须把当前前缀和 `-1` 撤销，否则会污染兄弟子树（路径必须向下，兄弟不经过本节点）

**示例：**
> 输入：root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8
> 输出：3

```java
class Solution {
    public int pathSum(TreeNode root, int targetSum) {
        Map<Long, Integer> preSum = new HashMap<>();
        preSum.put(0L, 1); // 哨兵：空路径前缀和为0，处理从根节点开始的路径
        return dfs(root, 0L, targetSum, preSum);
    }
    int dfs(TreeNode node, long cur, int target, Map<Long, Integer> preSum) {
        if (node == null) return 0;
        cur += node.val;
        // cur - target：若存在历史前缀和等于 cur-target，则说明从那个节点到当前节点的路径和为 target
        int count = preSum.getOrDefault(cur - target, 0); // ★ 前缀和相减
        preSum.put(cur, preSum.getOrDefault(cur, 0) + 1);
        count += dfs(node.left, cur, target, preSum);
        count += dfs(node.right, cur, target, preSum);
        // 回溯时必须移除当前前缀和：子树遍历完后返回父节点时，当前路径已不包含本节点，
        // 若不删除，会污染兄弟子树的前缀和统计（兄弟路径不可能经过本节点）
        preSum.put(cur, preSum.get(cur) - 1);
        return count;
    }
}
```

```python
class Solution:
    def pathSum(self, root: TreeNode, targetSum: int) -> int:
        self.pre_sum = {0: 1}  # 哨兵：前缀和 0 出现 1 次（处理从根开始的路径）
        def dfs(node, cur):
            if not node: return 0
            cur += node.val  # 累加当前路径前缀和
            # 路径和 = cur - 历史前缀和，查历史前缀和 = cur - targetSum 出现几次
            cnt = self.pre_sum.get(cur - targetSum, 0)
            self.pre_sum[cur] = self.pre_sum.get(cur, 0) + 1  # 记录当前前缀和
            cnt += dfs(node.left, cur) + dfs(node.right, cur)
            self.pre_sum[cur] -= 1  # ★ 回溯撤销：否则会污染兄弟子树的统计
            return cnt
        return dfs(root, 0)
```

---

### 49. 二叉树的最近公共祖先（中等）

**题目描述：** 找出二叉树中两个指定节点的最近公共祖先。

最近公共祖先：p 和 q 的所有公共祖先中，深度最深的那一个。

**解题思路：** 递归。如果当前节点为 null 或等于 p 或 q，直接返回当前节点。递归左右子树，若左右都不为空则当前节点为 LCA，否则返回非空那边。

**记忆点：**
- **口诀**：左右都找到，当前即祖先；只一侧有，向上冒泡
- **模板**：二叉树递归（模式 7）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：`root == p || root == q` 直接返回即可（提前剪枝），因为再往下只会是更浅的祖先

核心思想
递归函数返回值的含义（这是理解这道题的关键）：

lowestCommonAncestor(root, p, q) 返回的是——在 root 这棵子树中，找到的 p 或 q 或它们的 LCA。具体：

如果子树中能找到 p 或 q，就返回找到的那个节点
如果 p 和 q 的 LCA 就在这棵子树里，就返回 LCA
如果啥也没有，返回 null
**示例：**
> 输入：root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
> 输出：3

```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        // 终止条件：空节点，或找到了 p / q
        // root == p || root == q 直接返回：再往下只可能是更浅的祖先，剪枝即可
        if (root == null || root == p || root == q) return root;

        TreeNode left = lowestCommonAncestor(root.left, p, q);   // 去左子树找 p 或 q
        TreeNode right = lowestCommonAncestor(root.right, p, q); // 去右子树找 p 或 q

        // p、q 分别落在左右两侧 → 当前节点是它们的分岔点，即最近公共祖先
        if (left != null && right != null) return root; // ★ 左右都找到，当前即 LCA

        // 只有一侧有结果：把找到的那个节点向上"冒泡"传递
        return left != null ? left : right;
    }
}
```

```python
class Solution:
    def lowestCommonAncestor(self, root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
        # 终止条件：空，或当前节点就是 p/q（剪枝，向下只会更浅）
        if not root or root == p or root == q:
            return root
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        # 左右都非空：p、q 分居两侧，当前节点就是 LCA
        if left and right:
            return root
        return left or right  # 只一侧有，向上传递
```

---

## 九、图论

### 51. 岛屿数量（中等）

**题目描述：** 计算网格中岛屿数量（1 为陆地，0 为水）。

**解题思路：** DFS/BFS 沉岛法。遍历网格，遇到 '1' 时计数 +1，然后 DFS/BFS 将该岛屿所有相连的 '1' 置为 '0'（沉没）。O(mn)。

**记忆点：**
- **口诀**：见 1 就计数，沉没整座岛
- **模板**：DFS/BFS 图遍历（模式 8）
- **复杂度**：O(mn) 时间 / O(mn) 空间（递归栈）
- **坑**：沉岛改 `'0'` 替代 visited，省空间；先判越界再判是否陆地

**示例：**

> 输入：grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]
> 输出：1

```java
class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        // 遍历每个格子
        for (int i = 0; i < grid.length; i++)
            for (int j = 0; j < grid[0].length; j++)
                if (grid[i][j] == '1') {
                    count++;        // 发现新岛屿：遇到一个尚未沉没的陆地
                    dfs(grid, i, j); // ★ 沉没整座岛：把相连的 '1' 全部改成 '0'
                }
        return count;
    }
    // DFS 沉岛：把 (i,j) 所在岛屿的所有陆地改成 '0'，下次遍历不会再数到它
    void dfs(char[][] grid, int i, int j) {
        // 终止条件：越界 或 当前是水/已沉没（'0'），直接返回
        if (i < 0 || j < 0 || i >= grid.length || j >= grid[0].length || grid[i][j] == '0') return;
        grid[i][j] = '0'; // 沉岛：'1' 改 '0'，天然充当 visited，省掉额外标记数组
        // 向上下左右四个方向扩散，把整座岛沉完
        dfs(grid, i + 1, j);
        dfs(grid, i - 1, j);
        dfs(grid, i, j + 1);
        dfs(grid, i, j - 1);
    }
}
```

```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        def dfs(i, j):
            # 越界或水/已沉没，返回
            if i < 0 or j < 0 or i >= len(grid) or j >= len(grid[0]) or grid[i][j] == '0':
                return
            grid[i][j] = '0'  # 沉岛：'1'改'0'充当 visited，避免重复计数
            # 四方向扩散沉岛
            dfs(i + 1, j); dfs(i - 1, j)
            dfs(i, j + 1); dfs(i, j - 1)

        count = 0
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] == '1':  # 发现新岛屿
                    count += 1
                    dfs(i, j)          # 沉没整座岛
        return count
```

---

### 52. 腐烂的橘子（中等）

**题目描述：** 网格中 0 表示空，1 表示新鲜橘子，2 表示腐烂橘子。每分钟腐烂橘子会感染上下左右的新鲜橘子。求所有橘子腐烂所需分钟数。

**解题思路：** BFS 多源感染。将所有腐烂橘子（值为 2）入队，同时统计新鲜橘子数量。每轮 BFS 处理队列中同一层的所有腐烂橘子，感染邻居，时间 +1。最后若新鲜橘子为 0 则返回时间。

**记忆点：**
- **口诀**：多源一起烂，按层计时，新鲜清零停
- **模板**：BFS 多源（模式 8）
- **复杂度**：O(mn) 时间 / O(mn) 空间
- **坑**：结果要 `time - 1`（最后一轮没有新感染也 +1 了）；`fresh` 减到 0 才能返回时间

**示例：**
> 输入：grid = [[2,1,1],[1,1,0],[0,1,1]]
> 输出：4

```java
class Solution {
    public int orangesRotting(int[][] grid) {
        // m：网格行数；n：网格列数
        int m = grid.length, n = grid[0].length;
        // 队列用于BFS，存储腐烂橘子的坐标[i,j]
        Queue<int[]> q = new LinkedList<>();
        // fresh：记录新鲜橘子的总数量
        int fresh = 0;

        // ==========初始化阶段：多源BFS==========
        // 遍历整个网格，把所有一开始就腐烂的橘子加入队列，同时统计新鲜橘子数量
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                // grid[i][j]==2：腐烂橘子，入队作为BFS起点（多源起点）
                if (grid[i][j] == 2) {
                    q.offer(new int[]{i, j});
                }
                // grid[i][j]==1：新鲜橘子，计数+1
                else if (grid[i][j] == 1) {
                    fresh++;
                }
            }
        }

        // 边界情况：一开始就没有新鲜橘子，不需要时间，直接返回0
        if (fresh == 0) {
            return 0;
        }

        // time：记录腐烂扩散经过的分钟数
        int time = 0;
        // 上下左右四个方向偏移量：下、上、右、左
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        // ==========BFS层序遍历==========
        // 队列不为空，说明还有腐烂橘子可以去感染邻居
        while (!q.isEmpty()) {
            // 每一层代表1分钟，这一层所有橘子同时向外扩散感染
            time++;

            // q.size()：当前这一层的橘子个数；本层全部处理完，才代表1分钟结束
            // 注意不能把q.size写在for循环条件里，循环中队列会变化，这里先拿到本层大小
            for (int i = q.size(); i > 0; i--) {
                // 取出队首一个腐烂橘子的坐标
                int[] cur = q.poll();

                // 遍历四个方向，尝试感染相邻格子
                for (int[] d : dirs) {
                    // 计算相邻格子坐标
                    int x = cur[0] + d[0];
                    int y = cur[1] + d[1];

                    // 判断坐标不越界，并且该位置是新鲜橘子1
                    if (x >= 0 && x < m && y >= 0 && y < n && grid[x][y] == 1) {
                        // 新鲜橘子被感染，变成腐烂2
                        grid[x][y] = 2; // ★ 新鲜变腐烂
                        // 新鲜橘子总数减一
                        fresh--;
                        // 新腐烂的橘子入队，下一分钟由它继续感染周围
                        q.offer(new int[]{x, y});
                    }
                }
            }
        }

        /*
         * time-1解释：
         * 每次进入while循环time++。
         * 假设最后一轮：队列里的橘子处理完，产生新的腐烂橘子入队；
         * 下一轮while进来time++，但是这一层遍历完，没有产生任何新橘子，
         * 这一轮time++是无效的，没有发生实际感染，所以结果要减1。
         *
         * 如果fresh==0：全部橘子腐烂，返回真实时间time-1
         * 如果fresh>0：还有橘子永远无法被腐烂，返回-1
         */
        return fresh == 0 ? time - 1 : -1;
    }
}

```

```python
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        q = collections.deque()
        fresh = 0
        # 多源BFS：将所有初始腐烂橘子入队，同时统计新鲜橘子数
        for i in range(m):
            for j in range(n):
                if grid[i][j] == 2:
                    q.append((i, j))
                elif grid[i][j] == 1:
                    fresh += 1
        if fresh == 0: return 0
        time = 0
        dirs = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        while q:
            time += 1
            # 按层处理：同一分钟内的所有腐烂橘子同时感染邻居
            for _ in range(len(q)):
                x, y = q.popleft()
                for dx, dy in dirs:
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < m and 0 <= ny < n and grid[nx][ny] == 1:
                        grid[nx][ny] = 2
                        fresh -= 1  # 新鲜橘子变腐烂
                        q.append((nx, ny))
        return time - 1 if fresh == 0 else -1  # time-1因为最后一轮没有新的感染
```

---

### 53. 课程表（中等）

**题目描述：** 有 n 门课程和先修条件 prerequisites[i] = [ai, bi]（必须先修 bi 再修 ai），判断是否能完成所有课程。

**解题思路：** 拓扑排序（BFS）。构建邻接表和入度数组，将所有入度为 0 的节点入队。每处理一个节点，将其后继入度 -1，入度为 0 时入队。最后若计数 == n 则能修完。

**记忆点：**
- **口诀**：入度为零才入队，剥一层减一层，数完无环
- **模板**：拓扑排序（BFS + 入度）
- **复杂度**：O(V+E) 时间 / O(V+E) 空间
- **坑**：边方向 `bi → ai`（先修 bi 才能修 ai）；`count == numCourses` 才说明无环

**示例：**
> 输入：numCourses = 2, prerequisites = [[1,0]]
> 输出：true

```java
class Solution {
    // 判断是否能修完所有课程 = 判断课程依赖关系是否构成有向无环图(DAG)
    // 若存在环(如 A依赖B、B依赖A)，则无法开始任何一门课，返回 false
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // 邻接表：adj.get(i) 表示课程 i 的所有"后继"课程（即依赖 i 的课程）
        List<List<Integer>> adj = new ArrayList<>();
        // 入度数组：indegree[i] 表示课程 i 还有多少门先修课没修
        int[] indegree = new int[numCourses];
        // 初始化邻接表：每门课一个空列表
        for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());

        // 构建图：pre = [ai, bi] 表示"先修 bi 才能修 ai"
        for (int[] pre : prerequisites) {
            adj.get(pre[1]).add(pre[0]); // 建边 bi → ai（bi 修完后可解锁 ai）
            indegree[pre[0]]++;          // ai 的入度(未满足的先修课数) +1
        }

        // BFS 拓扑排序队列
        Queue<Integer> q = new LinkedList<>();
        // 所有入度为 0 的课程入队：它们没有任何先修要求，可以直接修
        for (int i = 0; i < numCourses; i++)
            if (indegree[i] == 0) q.offer(i);

        int count = 0; // 统计已"修完"（已从图中剥离）的课程数
        while (!q.isEmpty()) {
            int cur = q.poll(); // 取出一门当前可修的课
            count++;            // 修完这门课

            // 遍历这门课的所有后继课程：cur 修完后，它们的先修课少了一门
            for (int next : adj.get(cur)) {
                if (--indegree[next] == 0) // ★ 入度归零可入队
                    q.offer(next);         // 可以修了，入队
            }
        }

        // 若所有课程都被成功"修完"，说明图中无环，返回 true；
        // 否则有课程卡在环里永远入度不为 0，返回 false
        return count == numCourses;
    }
}
```

```python
class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        adj = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses  # 拓扑排序：入度数组
        for a, b in prerequisites:
            adj[b].append(a)  # b → a 的有向边
            indegree[a] += 1  # a的入度+1
        # 所有入度为0的节点入队（无先修要求的课程）
        q = collections.deque([i for i, d in enumerate(indegree) if d == 0])
        count = 0
        while q:
            cur = q.popleft()
            count += 1  # 修完一门课
            # 移除当前节点后，后继节点入度-1
            for nxt in adj[cur]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:  # 入度变为0则可修
                    q.append(nxt)
        return count == numCourses  # 修完所有课程说明无环
```

---

### 54. 实现 Trie（前缀树）（中等）

**题目描述：** 实现前缀树（Trie），支持 insert、search、startsWith。

**解题思路：** 每个节点包含一个长度为 26 的子节点数组和一个 isEnd 标志。插入时逐字符创建路径，查找时逐字符匹配。

**记忆点：**
- **口诀**：逐字符建路径，isEnd 标单词尾
- **模板**：前缀树（Trie）
- **复杂度**：O(L) 时间（L 为单词长度）/ O(26·N) 空间
- **坑**：`search` 要求 `isEnd == true`，`startsWith` 只看路径存在；这是两者唯一区别

**示例：**
> 输入：["Trie","insert","search","search","startsWith","insert","search"] , [[],["apple"],["apple"],["app"],["app"],["app"],["app"]]
> 输出：[null,null,true,false,true,null,true]

```java
class Trie {
    // children[i] 表示字符 'a'+i 对应的子节点，null 表示该字符不存在
    // 每个 Trie 节点本身就是一棵子树，同时也是一个 Trie 对象（递归结构）
    Trie[] children;
    boolean isEnd; // isEnd 标记当前节点是否是一个完整单词的结尾
    public Trie() { children = new Trie[26]; }
    public void insert(String word) {
        Trie node = this; // 从根节点开始（根节点不代表任何字符）
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) node.children[i] = new Trie();
            node = node.children[i];
        }
        node.isEnd = true; // ★ 标记单词结尾
    }
    public boolean search(String word) {
        Trie node = find(word);
        // 关键：不仅要路径存在，还要 isEnd == true，否则只是前缀匹配
        return node != null && node.isEnd;
    }
    public boolean startsWith(String prefix) {
        return find(prefix) != null; // 前缀匹配不关心 isEnd
    }
    Trie find(String s) {
        Trie node = this;
        for (char c : s.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) return null;
            node = node.children[i];
        }
        return node;
    }
}
```

```python
class Trie:
    def __init__(self):
        self.children = {}
        self.is_end = False

    def insert(self, word: str) -> None:
        node = self
        for ch in word:
            if ch not in node.children:
                node.children[ch] = Trie()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._find(word)
        return node is not None and node.is_end

    def startsWith(self, prefix: str) -> bool:
        return self._find(prefix) is not None

    def _find(self, s):
        node = self
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node
```

---

## 十、回溯

### 55. 全排列（中等）

**题目描述：** 返回无重复数字数组的所有排列。

**解题思路：** 回溯，通过交换元素位置来生成排列，不需要 used 数组。`backtrack(index)` 表示固定前 index 个位置，之后每个位置和当前 index 交换。

**记忆点：**
- **口诀**：固定一位，后面挨个换上来
- **模板**：回溯（模式 9）
- **复杂度**：O(n·n!) 时间 / O(n) 空间
- **坑**：swap 法不需要 used；交换后要再换回来（撤销）才能尝试下一种

**示例：**
> 输入：nums = [1,2,3]
> 输出：[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

```java
class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        List<Integer> path = new ArrayList<>();
        for (int num : nums) path.add(num);
        backtrack(0, path, res);
        return res;
    }
    // swap 法：不需要 used 数组
    // 把 path[start..end] 看作「未选择池」，path[0..start-1] 是已固定的前缀；
    // 每次从池中挑一个元素交换到 start 位置，选过的自然排到前面，没选的留在后面
    void backtrack(int start, List<Integer> path, List<List<Integer>> res) {
        if (start == path.size()) {   // 所有位置都固定完毕
            res.add(new ArrayList<>(path)); // 必须复制副本，path 之后还会被修改
            return;
        }
        for (int i = start; i < path.size(); i++) {
            Collections.swap(path, start, i); // ★ 交换选入前缀
            backtrack(start + 1, path, res);  // 固定下一位，递归
            Collections.swap(path, start, i); // 撤销交换，恢复原顺序再试下一个
        }
    }
}
```

```python
class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        res = []
        def backtrack(start):
            if start == len(nums):  # 所有位置固定完毕
                res.append(nums[:])  # 复制副本，nums 后面还会变
                return
            for i in range(start, len(nums)):
                nums[start], nums[i] = nums[i], nums[start]  # 选 nums[i] 放第 start 位
                backtrack(start + 1)  # 递归固定下一位
                nums[start], nums[i] = nums[i], nums[start]  # 撤销交换
        backtrack(0)
        return res
```

---

### 56. 子集（中等）

**题目描述：** 返回无重复数组的所有子集。

**解题思路：** 回溯。每个元素选或不选。更简洁：迭代构建，`res` 初始为空，每次将当前元素加入已有子集。

**记忆点：**
- **口诀**：先收路径，再往后选
- **模板**：回溯（模式 9）
- **复杂度**：O(n·2ⁿ) 时间 / O(n) 空间
- **坑**：递归一开始就 `res.add(路径)`（含空集）；`i+1` 传下去保证不重复选

**示例：**
> 输入：nums = [1,2,3]
> 输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]

```java
class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(0, nums, new ArrayList<>(), res);
        return res;
    }
    void backtrack(int start, int[] nums, List<Integer> path, List<List<Integer>> res) {
        // 每个节点的路径都是一个合法子集：先收下当前路径（首层是空集）
        res.add(new ArrayList<>(path)); // ★ 先收当前路径（含空集）
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);            // 选择当前元素
            backtrack(i + 1, nums, path, res); // i+1：每个元素只能选一次（子集不重复）
            path.remove(path.size() - 1); // 回溯，撤销选择
        }
    }
}
```

```python
class Solution:
    def subsets(self, nums: List[int]) -> List[List[int]]:
        res = []
        def backtrack(start, path):
            res.append(path[:]) # 先收当前路径（含空集）：每个节点的路径都是子集
            for i in range(start, len(nums)):
                path.append(nums[i]) # 选当前元素
                backtrack(i + 1, path) # i+1 保证每个元素只用一次
                path.pop() # 撤销
        backtrack(0, [])
        return res
```

---

### 57. 电话号码的字母组合（中等）

**题目描述：** 给定数字字符串，返回所有可能的字母组合（电话按键映射）。

**解题思路：** 回溯。使用映射表 `digitToLetters`，DFS 递归处理每个数字。

**记忆点：**
- **口诀**：逐位选字母，映射表查候选
- **模板**：回溯（模式 9）
- **复杂度**：O(3ⁿ·4ᵐ) 时间 / O(n) 空间
- **坑**：空输入直接返回 `[]`，不能返回 `[""]`；数字 2~9 映射字母数量不同

**示例：**
> 输入：digits = "23"
> 输出：["ad","ae","af","bd","be","bf","cd","ce","cf"]

```java
class Solution {
    // 数字(下标) → 对应字母；下标 0/1 无字母，占位空串
    String[] map = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};
    public List<String> letterCombinations(String digits) {
        List<String> res = new ArrayList<>();
        if (digits.isEmpty()) return res; // 空输入返回 []（不是 [""]）
        backtrack(digits, 0, new StringBuilder(), res);
        return res;
    }
    void backtrack(String digits, int idx, StringBuilder sb, List<String> res) {
        if (idx == digits.length()) { // 已为每个数字选好字母，得到一个完整组合
            res.add(sb.toString());
            return;
        }
        String letters = map[digits.charAt(idx) - '0']; // 当前数字对应的字母集合
        for (char c : letters.toCharArray()) {
            sb.append(c);                 // 选择一个字母
            backtrack(digits, idx + 1, sb, res); // 处理下一个数字
            sb.deleteCharAt(sb.length() - 1);    // 回溯：删掉刚选的字母
        }
    }
}
```

```python
class Solution:
    def letterCombinations(self, digits: str) -> List[str]:
        if not digits: return []  # 空输入返回 []（不是 [""]）
        mapping = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]
        res = []
        def backtrack(idx, path):
            if idx == len(digits):  # 每个数字都选好了字母
                res.append(''.join(path))
                return
            for ch in mapping[int(digits[idx])]:  # 当前数字对应所有字母
                path.append(ch)  # 选一个字母
                backtrack(idx + 1, path)  # 处理下一个数字
                path.pop()  # 回溯
        backtrack(0, [])
        return res
```

---

### 58. 组合总和（中等）

**题目描述：** 找出所有元素可以无限重复使用、和为 target 的组合。

**解题思路：** 回溯。每次可以选当前元素或跳过。选了当前元素后可以继续选同一个（因为无限重复）。

**记忆点：**
- **口诀**：可重复选，递归传 i 不传 i+1
- **模板**：回溯（模式 9）
- **复杂度**：O(n^(target/min)) 时间 / O(target) 空间
- **坑**：递归时 `start` 传 `i`（不是 `i+1`），因为元素可无限重复使用

**示例：**
> 输入：candidates = [2,3,6,7], target = 7
> 输出：[[2,2,3],[7]]

```java
class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), res);
        return res;
    }
    // remain：还需要凑多少；start：从哪个下标开始选（保证组合「只往后走」，避免重复组合）
    void backtrack(int[] nums, int remain, int start, List<Integer> path, List<List<Integer>> res) {
        if (remain < 0) return;                                     // 超出目标，剪枝
        if (remain == 0) { res.add(new ArrayList<>(path)); return; } // 恰好凑够，记录
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);
            // 关键：递归传 i 而不是 i+1 —— 因为元素可以无限重复使用
            // 传 start 不变就允许再次选择同一个数（如 [2,2,3]）
            backtrack(nums, remain - nums[i], i, path, res); // ★ i 不变，可重复选
            path.remove(path.size() - 1); // 回溯
        }
    }
}
```

```python
class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        res = []
        def backtrack(start, remain, path):
            if remain < 0: return  # 超出目标，剪枝
            if remain == 0:
                res.append(path[:])  # 恰好凑够，记录
                return
            for i in range(start, len(candidates)):
                path.append(candidates[i])
                backtrack(i, remain - candidates[i], path)  # 传 i 不传 i+1，可重复选
                path.pop()  # 回溯
        backtrack(0, target, [])
        return res
```

---

### 59. 括号生成（中等）

**题目描述：** 生成所有可能的 n 对有效括号组合。

**解题思路：** 回溯。维护 `open`（已用左括号数）和 `close`（已用右括号数）。当 open = close = n 时得到一个解。只要 open < n 就可以加左括号，只要 close < open 就可以加右括号。

**记忆点：**
- **口诀**：左括号看 n，右括号看左
- **模板**：回溯（模式 9）
- **复杂度**：O(Catalan(n)) 时间 / O(n) 空间
- **坑**：加右括号的条件是 `close < open`（不是 `close < n`），否则会生成 `())` 这类无效组合

**示例：**
> 输入：n = 3
> 输出：["((()))","(()())","(())()","()(())","()()()"]

```java
class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> res = new ArrayList<>();
        backtrack(n, 0, 0, new StringBuilder(), res);
        return res;
    }
    void backtrack(int n, int open, int close, StringBuilder sb, List<String> res) {
        if (sb.length() == 2 * n) { res.add(sb.toString()); return; }
        if (open < n) { // 左括号数量未用完就可以加
            sb.append('(');
            backtrack(n, open + 1, close, sb, res);
            sb.deleteCharAt(sb.length() - 1);
        }
        // 关键约束 close < open：右括号数必须严格小于左括号数才能加右括号
        // 这保证了前缀中不会出现右括号多于左括号的情况（即前缀始终有效）
        // 错误写法 close < n：那会生成 "(())" 和 "()()" 但也生成 "())(" 等无效组合
        if (close < open) { // ★ 右括号数必须小于左括号数
            sb.append(')');
            backtrack(n, open, close + 1, sb, res);
            sb.deleteCharAt(sb.length() - 1);
        }
    }
}
```

```python
class Solution:
    def generateParenthesis(self, n: int) -> List[str]:
        res = []
        def backtrack(open_cnt, close_cnt, path):
            if len(path) == 2 * n:
                res.append(''.join(path))
                return
            if open_cnt < n: # 左括号还没用完，可以加 '('
                path.append('(')
                backtrack(open_cnt + 1, close_cnt, path)
                path.pop()
            if close_cnt < open_cnt: # 右括号数必须小于左括号数才能加 ')'，保证有效
                path.append(')')
                backtrack(open_cnt, close_cnt + 1, path)
                path.pop()
        backtrack(0, 0, [])
        return res
```

---

### 60. 单词搜索（中等）

**题目描述：** 判断字符网格中是否存在给定单词的路径（相邻单元格连接）。

**解题思路：** DFS + 回溯 + 标记已访问。遍历每个格子作为起点，DFS 四个方向。用临时修改字符（如置为 '#'）代替 visited 数组，回溯时恢复。

**记忆点：**
- **口诀**：四向 DFS，改字符当访问标记
- **模板**：DFS + 回溯（模式 9）
- **复杂度**：O(mn·4^L) 时间 / O(L) 空间
- **坑**：`board[i][j] = '#'` 标记 + 回溯恢复原字符，避免用额外 visited；恢复必须在返回前做

**示例：**
> 输入：board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"
> 输出：true

```java
class Solution {
    public boolean exist(char[][] board, String word) {
        for (int i = 0; i < board.length; i++)
            for (int j = 0; j < board[0].length; j++)
                if (dfs(board, word, i, j, 0)) return true;
        return false;
    }
    boolean dfs(char[][] board, String word, int i, int j, int idx) {
        if (idx == word.length()) return true;
        if (i < 0 || j < 0 || i >= board.length || j >= board[0].length) return false;
        if (board[i][j] != word.charAt(idx)) return false;
        char tmp = board[i][j];
        // 直接在 board 上标记 '#' 而非额外 visited 数组：
        // board[i][j] != word[idx] 检查已经过滤掉了正常字符，'#' 永远不会匹配任何字母，
        // 所以后续递归会在此位置返回 false，天然避免重复访问。回溯时恢复原字符即可
        board[i][j] = '#'; // ★ 改字符当访问标记
        boolean found = dfs(board, word, i + 1, j, idx + 1)
                     || dfs(board, word, i - 1, j, idx + 1)
                     || dfs(board, word, i, j + 1, idx + 1)
                     || dfs(board, word, i, j - 1, idx + 1);
        board[i][j] = tmp; // 必须恢复：当前 DFS 路径结束后，其他起点可能需要用到该格
        return found;
    }
}
```

```python
class Solution:
    def exist(self, board: List[List[str]], word: str) -> bool:
        m, n = len(board), len(board[0])
        def dfs(i, j, idx):
            if idx == len(word): return True # 所有字符都匹配完成
            if i < 0 or j < 0 or i >= m or j >= n or board[i][j] != word[idx]:
                return False # 越界或字符不匹配
            tmp, board[i][j] = board[i][j], '#' # 标记已访问，'#' 不会匹配任何字母
            found = (dfs(i + 1, j, idx + 1) or dfs(i - 1, j, idx + 1) or
                     dfs(i, j + 1, idx + 1) or dfs(i, j - 1, idx + 1)) # 搜索四个方向
            board[i][j] = tmp # 恢复，其他起点可能用到
            return found
        for i in range(m):
            for j in range(n):
                if dfs(i, j, 0): return True # 每个格子作为起点尝试
        return False
```

---

### 61. 分割回文串（中等）

**题目描述：** 将字符串分割成所有子串都是回文串的方案。

**解题思路：** 回溯。从当前位置出发，尝试每个可能的回文前缀，将其加入路径并递归处理剩余部分。

**记忆点：**
- **口诀**：切出回文前缀，剩余递归再切
- **模板**：回溯（模式 9）
- **复杂度**：O(n·2ⁿ) 时间 / O(n) 空间
- **坑**：判断回文用双指针 `while(l<r)` 收缩，别用 `substring + reverse` 反复建字符串

**示例：**
> 输入：s = "aab"
> 输出：[["a","a","b"],["aa","b"]]

```java
class Solution {
    public List<List<String>> partition(String s) {
        List<List<String>> res = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), res);
        return res;
    }
    // start：当前待分割的起始位置；path：已经切出的回文段
    void backtrack(String s, int start, List<String> path, List<List<String>> res) {
        if (start == s.length()) { res.add(new ArrayList<>(path)); return; } // 全部切完
        // 枚举以 start 开头的每个可能回文子串
        for (int end = start; end < s.length(); end++) {
            if (isPalindrome(s, start, end)) { // ★ 切出回文前缀
                path.add(s.substring(start, end + 1)); // 加入当前回文段
                backtrack(s, end + 1, path, res);      // 递归切剩余部分
                path.remove(path.size() - 1);          // 回溯
            }
        }
    }
    // 双指针判断 s[l..r] 是否回文
    boolean isPalindrome(String s, int l, int r) {
        while (l < r) if (s.charAt(l++) != s.charAt(r--)) return false;
        return true;
    }
}
```

```python
class Solution:
    def partition(self, s: str) -> List[List[str]]:
        res = []
        def is_pal(l, r):  # 双指针判回文
            while l < r:
                if s[l] != s[r]: return False
                l += 1; r -= 1
            return True
        def backtrack(start, path):
            if start == len(s):
                res.append(path[:])  # 全部切完，记录方案
                return
            for end in range(start, len(s)):
                if is_pal(start, end):  # 切出回文前缀
                    path.append(s[start:end + 1])  # 加入当前回文段
                    backtrack(end + 1, path)  # 递归切剩余部分
                    path.pop()  # 回溯
        backtrack(0, [])
        return res
```

---

## 十一、二分查找

### 63. 搜索插入位置（简单）

**题目描述：** 在排序数组中查找目标值的插入位置。

**解题思路：** 标准二分查找。`while (l <= r)`，找到 mid，相等则返回，否则根据大小缩范围。最终 `l` 即为插入位置（循环退出时 l 恰好比 r 大 1，即 l = r + 1，而插入位置正是 l 指向的那个位置。）。

**记忆点：**
- **口诀**：退出时 l=r+1，l 就是插入位
- **模板**：二分查找（模式 5）
- **复杂度**：O(logn) 时间 / O(1) 空间
- **坑**：用 `while(l<=r)` 时返回 `l`（不是 r）；`mid = l + (r-l)/2` 防溢出

**示例：**
> 输入：nums = [1,3,5,6], target = 5
> 输出：2

```java
class Solution {
    public int searchInsert(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2; // 防止溢出
            if (nums[mid] == target) return mid;
            else if (nums[mid] < target) l = mid + 1; // target 在右半
            else r = mid - 1; // target 在左半
        }
        return l; // ★ l 就是插入位置
    }
}
```

```python
class Solution:
    def searchInsert(self, nums: List[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = (l + r) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                l = mid + 1 # target 在右半部分
            else:
                r = mid - 1 # target 在左半部分
        return l # l 就是插入位置：所有小于 target 的元素都在 l 左边
```

---

### 64. 搜索二维矩阵（中等）

**题目描述：** 在每行递增且下一行首元素大于上一行尾元素的矩阵中搜索目标。

**解题思路：** 将二维矩阵视为一维有序数组，二分查找。`idx = mid`，行 = `idx / n`，列 = `idx % n`。

**记忆点：**
- **口诀**：二维压成一维，行除列取模
- **模板**：二分查找（模式 5）
- **复杂度**：O(log(mn)) 时间 / O(1) 空间
- **坑**：映射 `matrix[mid/n][mid%n]`，行 = mid/n，列 = mid%n，别写反

**示例：**
> 输入：matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3
> 输出：true

```java
class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int m = matrix.length, n = matrix[0].length;
        int l = 0, r = m * n - 1; // 视为一维数组，索引范围 [0, m*n-1]
        while (l <= r) {
            int mid = l + (r - l) / 2;
            // 关键：将一维索引映射回二维坐标
            // 行号 = mid / n（每行 n 个元素，整除得到行号）
            // 列号 = mid % n（余数即列号）
            int val = matrix[mid / n][mid % n]; // ★ 一维映射回二维
            if (val == target) return true;
            else if (val < target) l = mid + 1;
            else r = mid - 1;
        }
        return false;
    }
}
```

```python
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        m, n = len(matrix), len(matrix[0])
        l, r = 0, m * n - 1 # 将二维视为一维有序数组
        while l <= r:
            mid = (l + r) // 2
            val = matrix[mid // n][mid % n] # 一维索引映射回二维：行=mid//n，列=mid%n
            if val == target:
                return True
            elif val < target:
                l = mid + 1
            else:
                r = mid - 1
        return False
```

---

### 65. 在排序数组中查找元素的第一个和最后一个位置（中等）

**题目描述：** 找 target 在升序数组中的起始和结束位置。

**解题思路：** 两次二分：第一次找第一个 >= target 的位置（左边界），第二次找第一个 > target 的位置减 1（右边界）。若左边界位置的值 != target 则没找到。

**记忆点：**
- **口诀**：左界找 >=target，右界找 >=(target+1) 再减一
- **模板**：二分查找（模式 5）
- **复杂度**：O(logn) 时间 / O(1) 空间
- **坑**：`r` 初始化为 `nums.length`（不是 n-1），否则 target 大于所有元素时越界；用 `while(l<r)` 配合 `r=mid`

**示例：**
> 输入：nums = [5,7,7,8,8,10], target = 8
> 输出：[3,4]

```java
class Solution {
    public int[] searchRange(int[] nums, int target) {
        int left = findLeft(nums, target); // 找第一个 >= target 的位置
        if (left == nums.length || nums[left] != target) return new int[]{-1, -1};
        int right = findLeft(nums, target + 1) - 1; // 找第一个 >= target+1 的位置，再 -1 得到右边界
        return new int[]{left, right};
    }
    int findLeft(int[] nums, int target) {
        int l = 0, r = nums.length; // r 初始化为 nums.length，处理 target 大于所有元素的情况
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] >= target) r = mid; // ★ 收缩右边界
            else l = mid + 1; // 收缩左边界
        }
        return l; // l 是第一个 >= target 的位置
    }
}
```

```python
class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def find_left(t):
            l, r = 0, len(nums) # r 初始化为 len(nums) 处理 target 大于所有元素的情况
            while l < r:
                mid = (l + r) // 2
                if nums[mid] >= t:
                    r = mid # 收缩右边界
                else:
                    l = mid + 1 # 收缩左边界
            return l # l 是第一个 >= t 的位置
        left = find_left(target) # 找左边界
        if left == len(nums) or nums[left] != target:
            return [-1, -1]
        right = find_left(target + 1) - 1 # 右边界 = 第一个 >= target+1 的位置 - 1
        return [left, right]
```

---

### 66. 搜索旋转排序数组（中等）

**题目描述：** 在旋转过的升序数组中搜索目标值，无重复元素。

**解题思路：** 二分查找。先判断 `nums[mid]` 在左侧有序段还是右侧有序段，再根据 target 位置调整指针。

**记忆点：**
- **口诀**：先判哪半有序，再看 target 落哪
- **模板**：二分查找（模式 5）
- **复杂度**：O(logn) 时间 / O(1) 空间
- **坑**：用 `nums[l] <= nums[mid]` 判断左半有序；target 严格落在有序区间内才去那半

**示例：**
> 输入：nums = [4,5,6,7,0,1,2], target = 0
> 输出：4

```java
class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            // 旋转数组的核心：mid 将数组分成两半，必有一半是完全有序的
            // 用 nums[l] <= nums[mid] 判断左半是否有序：
            // 若左端点 <= 中间点，说明从 l 到 mid 没有"断裂点"，左半有序
            if (nums[l] <= nums[mid]) { // ★ 判哪半有序
                // 若 target 落在左半有序区间内，去左边找；否则去右边
                if (nums[l] <= target && target < nums[mid]) r = mid - 1;
                else l = mid + 1;
            } else { // 否则右半部分有序（旋转点必在左半部分）
                if (nums[mid] < target && target <= nums[r]) l = mid + 1;
                else r = mid - 1;
            }
        }
        return -1;
    }
}
```

```python
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = (l + r) // 2
            if nums[mid] == target:
                return mid
            if nums[l] <= nums[mid]:  # 左半部分有序
                if nums[l] <= target < nums[mid]:
                    r = mid - 1
                else:
                    l = mid + 1
            else:  # 右半部分有序
                if nums[mid] < target <= nums[r]:
                    l = mid + 1
                else:
                    r = mid - 1
        return -1
```

---

### 67. 寻找旋转排序数组中的最小值（中等）

**题目描述：** 在旋转过的升序数组（无重复）中找最小值。

**解题思路：** 二分查找。`nums[mid] > nums[r]` 说明最小值在右半部分，`l = mid + 1`；否则最小值在左半部分（含 mid），`r = mid`。

**记忆点：**
- **口诀**：mid 比 r 大往右，否则往左
- **模板**：二分查找（模式 5）
- **复杂度**：O(logn) 时间 / O(1) 空间
- **坑**：与 `nums[r]` 比较（不是 nums[l]）；`r = mid` 不能写成 `mid-1`，否则会跳过最小值

**示例：**
> 输入：nums = [3,4,5,1,2]
> 输出：1

```java
class Solution {
    public int findMin(int[] nums) {
        int l = 0, r = nums.length - 1;
        while (l < r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] > nums[r]) l = mid + 1; // ★ mid 比 r 大往右
            else r = mid; // 最小值在左半部分（含 mid），不能 mid-1 否则可能跳过最小值
        }
        return nums[l];
    }
}
```

```python
class Solution:
    def findMin(self, nums: List[int]) -> int:
        l, r = 0, len(nums) - 1
        while l < r:
            mid = (l + r) // 2
            if nums[mid] > nums[r]:
                l = mid + 1 # nums[mid] > nums[r]，最小值在右半部分
            else:
                r = mid # 最小值在左半部分（含 mid）
        return nums[l]
```

---

## 十二、栈

### 69. 有效的括号（简单）

**题目描述：** 判断字符串中的括号是否闭合正确。

**解题思路：** 栈。遇到左括号压入对应右括号；遇到右括号时检查栈顶是否匹配，不匹配或栈空（因为栈为空说明还有一个右括号不匹配）则无效。最后栈空为有效。

**记忆点：**
- **口诀**：左括号压右括号，遇右弹栈对
- **模板**：栈（模式 10）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：压入「对应的右括号」比压左括号更省事；遇右括号先判栈空再弹栈

**示例：**

> 输入：s = "()[]{}"
> 输出：true

```java
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            // 遇到左括号，压入对应的右括号（巧妙的简化）
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            // 遇到右括号：栈空或与栈顶不匹配 → 无效
            else if (stack.isEmpty() || stack.pop() != c) return false; // ★ 遇右弹栈对
        }
        return stack.isEmpty(); // 所有括号都匹配完毕
    }
}
```

```python
class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}  # 右括号→左括号的映射
        for ch in s:
            if ch in '({[':
                stack.append(ch)  # 左括号入栈
            else:
                # 栈空或栈顶不匹配说明无效
                if not stack or stack[-1] != pairs[ch]:
                    return False
                stack.pop()  # 匹配成功，弹出
        return not stack  # 栈空表示全部匹配
```

---

### 70. 最小栈（中等）

**题目描述：** 设计栈，支持 push/pop/top/getMin 操作，所有操作 O(1)。

**解题思路：** 双栈法。一个普通栈存元素，另一个栈 `minStack` 存当前位置的最小值。push 时若 x <= minStack.top() 或 minStack 为空，则压入 minStack。

**记忆点：**
- **口诀**：一栈存数，一栈存最小
- **模板**：双栈（模式 10）
- **复杂度**：所有操作 O(1)
- **坑**：push 时用 `<=` 压入（等于也要压），否则 pop 时会误删最小值；pop 比较用 `equals` 不用 `==`

**示例：**
> 输入：["MinStack","push","push","push","getMin","pop","top","getMin"] , [[],[-2],[0],[-3],[],[],[],[]]
> 输出：[null,null,null,null,-3,null,0,-2]

```java
class MinStack {
    Stack<Integer> stack = new Stack<>();
    Stack<Integer> minStack = new Stack<>(); // 同步记录每个时刻的最小值

    public void push(int val) {
        stack.push(val);
        // <= 而非 <：等于时也要压入，否则pop时会误删
        if (minStack.isEmpty() || val <= minStack.peek()) minStack.push(val); // ★ <= 同步压最小
    }
    public void pop() {
        // equals 而非 ==：Integer需要比较值而非引用
        if (stack.pop().equals(minStack.peek())) minStack.pop();
    }
    public int top() { return stack.peek(); }
    public int getMin() { return minStack.peek(); }
}
```

```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []  # 同步记录每个时刻的最小值

    def push(self, val: int) -> None:
        self.stack.append(val)
        # <= 而非 <：等于时也要压入，否则pop时会误删
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)

    def pop(self) -> None:
        if self.stack.pop() == self.min_stack[-1]:
            self.min_stack.pop()  # 弹出的恰好是最小值，minStack也弹出

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.min_stack[-1]
```

---

### 71. 字符串解码（中等）

**题目描述：** `3[a2[c]]` → `accaccacc`，数字表示重复次数。

**解题思路：** 双栈法（一个存重复次数，一个存之前的字符串）。遇到数字累计；遇到 `[` 将当前数和当前字符串入栈并重置；遇到 `]` 将栈顶数字弹出，重复当前字符串后与栈顶字符串拼接。

**记忆点：**
- **口诀**：数栈 + 串栈，`[` 压栈，`]` 弹栈拼
- **模板**：双栈（模式 10）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：数字要 `num = num*10 + (c-'0')` 处理多位数；`[` 时同时压数字和字符串

**示例：**
> 输入：s = "3[a]2[bc]"
> 输出："aaabcbc"

```java
class Solution {
    public String decodeString(String s) {
        Stack<Integer> numStack = new Stack<>();
        Stack<StringBuilder> strStack = new Stack<>();
        StringBuilder cur = new StringBuilder(); // 当前正在构建的字符串
        int num = 0;
        for (char c : s.toCharArray()) {
            if (Character.isDigit(c)) {
                num = num * 10 + (c - '0'); // 累计数字，处理多位数
            } else if (c == '[') {
                numStack.push(num); // 保存当前重复次数
                strStack.push(cur); // 保存遇到 '[' 之前的字符串
                num = 0; // 重置
                cur = new StringBuilder(); // 开始构建括号内的新字符串
            } else if (c == ']') {
                StringBuilder tmp = strStack.pop(); // 取出之前的字符串
                int repeat = numStack.pop(); // 取出重复次数
                for (int i = 0; i < repeat; i++) tmp.append(cur); // 重复当前字符串
                cur = tmp; // ★ 重复后拼接回去
            } else {
                cur.append(c);
            }
        }
        return cur.toString();
    }
}
```

```python
class Solution:
    def decodeString(self, s: str) -> str:
        num_stack, str_stack = [], []
        cur, num = "", 0
        for ch in s:
            if ch.isdigit():
                num = num * 10 + int(ch) # 累计数字，处理多位数
            elif ch == '[':
                num_stack.append(num) # 保存重复次数
                str_stack.append(cur) # 保存之前的字符串
                num, cur = 0, "" # 重置，开始构建括号内字符串
            elif ch == ']':
                cur = str_stack.pop() + num_stack.pop() * cur # 拼接：之前的字符串 + 重复当前字符串
            else:
                cur += ch
        return cur
```

---

### 72. 每日温度（中等）

**题目描述：** 返回数组 answer，answer[i] 是等待几天后温度才会更高。

**解题思路：** 单调递减栈（存下标）。栈中元素对应的温度是递减的。新温度高于栈顶温度时，弹出栈顶并计算差值。O(n)。

**记忆点：**
- **口诀**：栈存下标，遇大弹栈算距离
- **模板**：单调栈（模式 10）
- **复杂度**：O(n) 时间 / O(n) 空间
- **坑**：栈存「下标」不存值（要算距离）；是「下一个更大」就弹，维护递减栈

**示例：**
> 输入：temperatures = [73,74,75,71,69,72,76,73]
> 输出：[1,1,4,2,1,1,0,0]

```java
class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] res = new int[n];
        Stack<Integer> stack = new Stack<>(); // 单调递减栈，存下标
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
                int prev = stack.pop(); // 遇到更暖和的温度，弹出
                res[prev] = i - prev; // ★ 遇大弹栈算距离
            }
            stack.push(i); // 当前温度入栈
        }
        return res;
    }
}
```

```python
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        res = [0] * n
        stack = [] # 单调递减栈，存下标
        for i, t in enumerate(temperatures):
            while stack and t > temperatures[stack[-1]]:
                prev = stack.pop() # 遇到更暖和的温度，弹出
                res[prev] = i - prev # 计算等待天数
            stack.append(i) # 当前温度入栈
        return res
```

---

## 十三、堆

### 74. 数组中的第K个最大元素（中等）

**题目描述：** 找出数组中第 k 大的元素。

**解题思路：** 大小为 k 的最小堆。遍历数组元素入堆，堆大小超过 k 时弹出最小元素。最终堆顶即为第 k 大元素。O(nlogk)。

**记忆点：**
- **口诀**：最小堆留 k 个，堆顶就是第 k 大
- **模板**：堆（模式 11）
- **复杂度**：O(nlogk) 时间 / O(k) 空间
- **坑**：第 K 大用「最小堆」不是最大堆；堆顶始终是当前 k 个里最小的

**示例：**
> 输入：nums = [3,2,1,5,6,4], k = 2
> 输出：5

```java
class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> pq = new PriorityQueue<>(); // 最小堆，堆顶始终是当前堆中最小元素
        for (int num : nums) {
            pq.offer(num);
            if (pq.size() > k) pq.poll(); // ★ 保持堆大小为 k
        }
        return pq.peek(); // 堆顶即第 k 大的元素
    }
}
```

```python
class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        import heapq
        heap = [] # 最小堆，堆顶始终是当前堆中最小的
        for num in nums:
            heapq.heappush(heap, num)
            if len(heap) > k:
                heapq.heappop(heap) # 保持堆大小为 k，淘汰最小的
        return heap[0] # 堆顶即第 k 大的元素
```

---

### 75. 前 K 个高频元素（中等）

**题目描述：** 找出出现频率前 k 高的元素。

**解题思路：** 先用哈希表统计频率，然后用大小为 k 的最小堆按频率排序，保持堆中为 k 个最高频元素。O(nlogk)。

**记忆点：**
- **口诀**：哈希计数，最小堆按频排，留 k 个
- **模板**：堆 + 哈希（模式 11）
- **复杂度**：O(nlogk) 时间 / O(n) 空间
- **坑**：堆的比较器按「频率」排序（不是值）；取结果时注意堆内顺序不是最终顺序

**示例：**
> 输入：nums = [1,1,1,2,2,3], k = 2
> 输出：[1,2]

```java
class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int num : nums) freq.put(num, freq.getOrDefault(num, 0) + 1); // 统计频率
        PriorityQueue<Integer> pq = new PriorityQueue<>((a, b) -> freq.get(a) - freq.get(b)); // 最小堆，按频率排序
        for (int num : freq.keySet()) {
            pq.offer(num);
            if (pq.size() > k) pq.poll(); // ★ 淘汰低频，留 k 个高频
        }
        int[] res = new int[k];
        for (int i = k - 1; i >= 0; i--) res[i] = pq.poll(); // 倒序取出
        return res;
    }
}
```

```python
class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        import heapq
        freq = {}
        for num in nums:
            freq[num] = freq.get(num, 0) + 1 # 统计频率
        heap = [] # 最小堆，按频率排序
        for num, cnt in freq.items():
            heapq.heappush(heap, (cnt, num)) # 频率在前，Python 按第一个元素比较
            if len(heap) > k:
                heapq.heappop(heap) # 淘汰频率最低的，保留 k 个最高频
        return [num for _, num in heap]
```

---

## 十四、贪心算法

### 77. 买卖股票的最佳时机（简单）

**题目描述：** 找出一天买入、一天卖出能获得的最大利润。

**解题思路：** 遍历中维护历史最低价格 `minPrice`。每天计算 `price - minPrice` 并更新最大利润。O(n)。

**记忆点：**
- **口诀**：边走边记最低价，当天卖算最大
- **模板**：贪心（模式 13）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：只能买卖一次，先更新 minPrice 再算利润，顺序别反

**示例：**

> 输入：prices = [7,1,5,3,6,4]
> 输出：5 （第2天买入1，第5天卖出6）

```java
class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE, maxProfit = 0;
        for (int price : prices) {
            minPrice = Math.min(minPrice, price); // ★ 记历史最低
            maxProfit = Math.max(maxProfit, price - minPrice); // 当天卖出能赚的利润
        }
        return maxProfit;
    }
}
```

```python
class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            min_price = min(min_price, price) # 维护历史最低价格
            max_profit = max(max_profit, price - min_price) # 当天卖出能赚的利润
        return max_profit
```

---

### 78. 跳跃游戏（中等）

**题目描述：** 判断从数组第一个位置出发，能否到达最后一个位置。

**解题思路：** 贪心，维护最远可达位置 `maxReach`。遍历时若 `i > maxReach` 返回 false；否则更新 `maxReach = max(maxReach, i + nums[i])`。

**记忆点：**
- **口诀**：维护最远可达，够不着就 false
- **模板**：贪心（模式 13）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：先判 `i > maxReach`（当前位置都到不了）再更新 maxReach

**示例：**
> 输入：nums = [2,3,1,1,4]
> 输出：true

```java
class Solution {
    public boolean canJump(int[] nums) {
        int maxReach = 0; // 当前能到达的最远位置
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false; // 当前位置不可达
            maxReach = Math.max(maxReach, i + nums[i]); // ★ 更新最远可达
        }
        return true;
    }
}
```

```python
class Solution:
    def canJump(self, nums: List[int]) -> bool:
        max_reach = 0 # 当前能到达的最远位置
        for i, num in enumerate(nums):
            if i > max_reach:
                return False # 当前位置不可达
            max_reach = max(max_reach, i + num) # 贪心更新最远可达位置
        return True
```

---

### 79. 跳跃游戏 II（中等）

**题目描述：** 求从数组第一个位置到最后一个位置的最少跳跃次数。

**解题思路：** 贪心 BFS。`curEnd` 当前步能到的最远位置，`curMax` 下一步能到的最远位置。当 `i == curEnd` 时步数 +1。

**记忆点：**
- **口诀**：走到当前步边界，就得多跳一步
- **模板**：贪心（模式 13）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：只遍历到 `n-2`（到 `n-1` 会多算一跳）；`i == curEnd` 时 `jumps++` 并更新边界

**示例：**
> 输入：nums = [2,3,1,1,4]
> 输出：2

```java
class Solution {
    public int jump(int[] nums) {
        int jumps = 0, curEnd = 0, curMax = 0;
        // 只遍历到 n-2：走到 n-2 时最后一步必能到 n-1（题目保证可达）
        // 若遍历到 n-1，会在终点多算一次跳跃
        for (int i = 0; i < nums.length - 1; i++) {
            // 贪心：在「当前步可达范围」内，记录下一步能跳到的最远位置
            curMax = Math.max(curMax, i + nums[i]);
            // 走到当前步的覆盖边界 curEnd，必须跳一次进入下一步，
            // 并把边界更新为之前积累的最远位置
            if (i == curEnd) { // ★ 走到边界，多跳一步
                jumps++;
                curEnd = curMax; // 更新下一步的边界
            }
        }
        return jumps;
    }
}
```

```python
class Solution:
    def jump(self, nums: List[int]) -> int:
        jumps = cur_end = cur_max = 0
        # 只遍历到 n-2：到达 n-2 时，最后一步必然能跳到 n-1（题目保证可达）
        # 如果遍历到 n-1，会在最后一个位置多算一次跳跃
        for i in range(len(nums) - 1):
            # cur_max：当前这一步和之前所有步中，能跳到的最远位置
            cur_max = max(cur_max, i + nums[i])
            # cur_end：当前跳跃步数所能覆盖的边界
            # 走到边界时，必须再跳一步（步数+1），更新边界为新的最远可达位置
            if i == cur_end:
                jumps += 1
                cur_end = cur_max
        return jumps
```

---

### 80. 划分字母区间（中等）

**题目描述：** 将字符串划分为尽可能多的片段，使同一字母只出现在一个片段中。

**解题思路：** 先记录每个字母最后出现的位置 `last[]`。再遍历，维护当前片段的结束位置 `end`。当 `i == end` 时即为片段终点。

**记忆点：**
- **口诀**：记最后出现，end 撑到最远，i 到 end 就切
- **模板**：贪心（模式 13）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：`end = max(end, last[ch])` 持续扩展；`i == end` 时切片段并 `start = i+1`

**示例：**
> 输入：s = "ababcbacadefegdehijhklij"
> 输出：[9,7,8]

```java
class Solution {
    public List<Integer> partitionLabels(String s) {
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) last[s.charAt(i) - 'a'] = i; // 记录每个字母最后出现的位置
        List<Integer> res = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']); // 贪心扩展当前片段的右边界
            if (i == end) { // ★ i 到 end 就切片段
                res.add(end - start + 1); // 记录片段长度
                start = i + 1; // 开始下一个片段
            }
        }
        return res;
    }
}
```

```python
class Solution:
    def partitionLabels(self, s: str) -> List[int]:
        last = {ch: i for i, ch in enumerate(s)}
        res, start, end = [], 0, 0
        for i, ch in enumerate(s):
            end = max(end, last[ch])
            if i == end:
                # 当前片段结束，记录长度
                res.append(end - start + 1)
                # 下一个片段的起始位置是 i+1（不是 end+1）
                # 因为 end 只是当前片段内字母的最后出现位置，片段边界就是 i（= end）
                start = i + 1
        return res
```

---

## 十五、动态规划

### 81. 爬楼梯（简单）

**题目描述：** 每次爬 1 或 2 阶，共有多少种方式爬到第 n 阶。

**解题思路：** `dp[i] = dp[i-1] + dp[i-2]`，即斐波那契数列。可优化为 O(1) 空间：`a, b = 1, 1`，每次 `a, b = b, a + b`。

**记忆点：**
- **口诀**：爬法 = 前两阶之和（斐波那契）
- **模板**：动态规划（模式 12）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：`a`、`b` 都初始化为 1（dp[0]=1, dp[1]=1），不是 0、1

**示例：**
> 输入：n = 3
> 输出：3 （1+1+1, 1+2, 2+1）

```java
class Solution {
    public int climbStairs(int n) {
        int a = 1, b = 1; // a=dp[0], b=dp[1]
        for (int i = 2; i <= n; i++) {
            int c = a + b; // ★ 斐波那契转移
            a = b;
            b = c;
        }
        return b;
    }
}
```

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        a = b = 1  # a=dp[0], b=dp[1]
        for _ in range(2, n + 1):
            a, b = b, a + b  # dp[i] = dp[i-2] + dp[i-1]，斐波那契
        return b
```

---

### 82. 杨辉三角（简单）

**题目描述：** 生成杨辉三角前 numRows 行。

**解题思路：** 迭代。每行首尾为 1，中间元素为上一行相邻两数之和。

**记忆点：**
- **口诀**：首尾 1，中间上两数和
- **模板**：动态规划（模式 12）
- **复杂度**：O(n²) 时间 / O(n²) 空间
- **坑**：第 i 行有 i+1 个元素；中间元素 `= 上一行[j-1] + 上一行[j]`

**示例：**
> 输入：numRows = 5
> 输出：[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]

```java
class Solution {
    public List<List<Integer>> generate(int numRows) {
        List<List<Integer>> res = new ArrayList<>();
        // 行的索引
        for (int i=0; i<numRows; i++) {
            List<Integer> row = new ArrayList<>();
            row.add(1); // 每行第一个元素为1
            // 列的索引,每行最后一个元素是1，所以不用遍历
            for (int j=1; j<i; j++) {
                // 中间元素 = 上一行相邻两数之和
                row.add(res.get(i-1).get(j-1) + res.get(i-1).get(j)); // ★ 上两数和
            } 
            if (i > 0) row.add(1);// 每行尾元素（第一行除外）
            res.add(row);
        }
        return res;
    }
}
```

```python
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        res = []
        for i in range(numRows):
            row = [1] * (i + 1)  # 全部初始化为1
            for j in range(1, i):
                # 中间元素 = 上一行相邻两数之和
                row[j] = res[i - 1][j - 1] + res[i - 1][j]
            res.append(row)
        return res
```

---

### 83. 打家劫舍（中等）

**题目描述：** 不能偷相邻房屋，求最大金额。

**解题思路：** `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`。偷或不偷第 i 家。观察转移方程：**`dp[i]` 只依赖 `dp[i-1]` 和 `dp[i-2]`**，不需要整个数组。因此用两个变量滚动替代： `prev2`（i-2）和 `prev1`（i-1）。

**记忆点：**

- **口诀**：偷当前就隔一家，不偷就取前一家
- **模板**：动态规划（模式 12）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：`cur = max(prev1, prev2 + num)`，两个分支分别对应「不偷」和「偷」

`nums = [2,7,9,3,1]` 为例：

| 轮次 | num  | prev2 | prev1 | cur = max(prev1, prev2+num) | 说明               |
| ---- | ---- | ----- | ----- | --------------------------- | ------------------ |
| 初始 | -    | 0     | 0     | -                           |                    |
| 1    | 2    | 0     | 0     | max(0, 0+2)=2               | 偷第1家            |
| 2    | 7    | 0     | 2     | max(2, 0+7)=7               | 偷第2家，放弃第1家 |
| 3    | 9    | 2     | 7     | max(7, 2+9)=11              | 偷第1+3家          |
| 4    | 3    | 7     | 11    | max(11, 7+3)=11             | 不偷第4家          |
| 5    | 1    | 11    | 11    | max(11, 11+1)=12            | 偷第1+3+5家        |

**示例：**
> 输入：nums = [1,2,3,1]
> 输出：4 （偷1号+3号）

```java
class Solution {
    public int rob(int[] nums) {
        int prev2 = 0, prev1 = 0;
        // ★ 初始化为0而非nums[0]！
        // prev2=dp[-1]=0（虚拟的第-1家，收益为0）
        // prev1=dp[0]的"前一个状态"=0（还没开始偷）
        // 这样第一轮循环时 cur = max(0, 0+nums[0]) = nums[0]，逻辑自洽
        for (int num : nums) {
            int cur = Math.max(prev1, prev2 + num);
            // prev1      → 不偷当前家，继承上一家的最优解
            // prev2 + num → 偷当前家，加上上上家的最优解

            prev2 = prev1;  // 窗口右移：旧的dp[i-1]变成新的dp[i-2]
            prev1 = cur;    // 窗口右移：当前dp[i]变成下一轮的dp[i-1]
        }
        return prev1; // 循环结束后prev1就是dp[n-1]
    }
}
```

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        prev2 = prev1 = 0  # prev2=dp[i-2], prev1=dp[i-1]
        for num in nums:
            # dp[i] = max(不偷当前, 偷当前+dp[i-2])
            cur = max(prev1, prev2 + num)
            prev2, prev1 = prev1, cur
        return prev1
```

---

### 84. 完全平方数（中等）

**题目描述：** 找到最少的完全平方数个数，使其和等于 n。

**解题思路：** BFS 按层找最小步数，或 DP：`dp[i] = min(dp[i - j*j]) + 1`，j 从 1 到 sqrt(i)。

**记忆点：**
- **口诀**：凑到 i 的最少个数 = 减去一个平方数后 +1
- **模板**：动态规划（模式 12）
- **复杂度**：O(n·√n) 时间 / O(n) 空间
- **坑**：dp 初始化为 `MAX_VALUE`，`dp[0]=0`；内层循环 j*j<=i

**示例：**
> 输入：n = 12
> 输出：3 （4+4+4）

```java
class Solution {
    public int numSquares(int n) {
        int[] dp = new int[n + 1];
        Arrays.fill(dp, Integer.MAX_VALUE); // 初始化为最大值
        dp[0] = 0; // 和为0需要0个完全平方数
        for (int i = 1; i <= n; i++)
            for (int j = 1; j * j <= i; j++)
                // 对每个完全平方数 j*j，取最小方案
                dp[i] = Math.min(dp[i], dp[i - j * j] + 1); // ★ 减平方数 +1
        return dp[n];
    }
}
```

```python
class Solution:
    def numSquares(self, n: int) -> int:
        dp = [float('inf')] * (n + 1)  # 初始化为最大值
        dp[0] = 0  # 和为0需要0个完全平方数
        for i in range(1, n + 1):
            j = 1
            while j * j <= i:
                dp[i] = min(dp[i], dp[i - j * j] + 1)  # 取最小方案
                j += 1
        return dp[n]
```

---

### 85. 零钱兑换（中等）

**题目描述：** 用最少数量的硬币凑出目标金额，不限使用次数。

**解题思路：** DP：`dp[i] = min(dp[i - coin]) + 1`。dp[i] 表示凑出金额 i 的最少硬币数。初始化为大数。

**记忆点：**
- **口诀**：凑到 i 的最少枚 = 各币种里最少 +1
- **模板**：动态规划（完全背包）（模式 12）
- **复杂度**：O(amount·n) 时间 / O(amount) 空间
- **坑**：dp 初始化为 `amount+1`（不是 MAX，防溢出）；`dp[0]=0`；无解返回 -1

**示例：**
> 输入：coins = [1,2,5], amount = 11
> 输出：3 （5+5+1）

```java
class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1); // 初始化为不可能的大值，amount+1 即"无穷大"
        dp[0] = 0; // 金额0需要0枚硬币
        for (int i = 1; i <= amount; i++)
            for (int coin : coins)
                if (i >= coin) dp[i] = Math.min(dp[i], dp[i - coin] + 1); // ★ 减硬币 +1
        return dp[amount] > amount ? -1 : dp[amount]; // 若仍为初始值说明无法凑出
    }
}
```

```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [amount + 1] * (amount + 1)  # 初始化为不可能的大值
        dp[0] = 0  # 金额0需要0枚硬币
        for i in range(1, amount + 1):
            for coin in coins:
                if i >= coin:
                    dp[i] = min(dp[i], dp[i - coin] + 1)
        # 若dp[amount]仍为初始值，说明无法凑出
        return dp[amount] if dp[amount] <= amount else -1
```

---

### 86. 单词拆分（中等）

**题目描述：** 判断字符串 s 是否可以由 wordDict 中的单词拼接而成。

**解题思路：** DP：`dp[i]` 表示 s[0:i] 能否拆分为字典中的单词。对于每个 j < i，若 `dp[j]` 且 `s[j:i]` 在字典中，则 `dp[i] = true`。

**记忆点：**
- **口诀**：前 j 能拆 + 剩段在字典 → 前 i 能拆
- **模板**：动态规划（模式 12）
- **复杂度**：O(n²) 时间 / O(n) 空间
- **坑**：`dp[0]=true`；用 `Set` 加速查字典；找到一种拆分就 break

**示例：**
> 输入：s = "leetcode", wordDict = ["leet","code"]
> 输出：true

```java
class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        Set<String> set = new HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true; // 空字符串可拆分
        for (int i = 1; i <= s.length(); i++)
            for (int j = 0; j < i; j++)
                if (dp[j] && set.contains(s.substring(j, i))) { // ★ 前段能拆 + 剩段在字典
                    dp[i] = true; // s[0:i] 可拆分
                    break; // 找到一种拆分即可
                }
        return dp[s.length()];
    }
}
```

```python
class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        word_set = set(wordDict)
        dp = [False] * (len(s) + 1)
        dp[0] = True # 空字符串可拆分
        for i in range(1, len(s) + 1):
            for j in range(i):
                if dp[j] and s[j:i] in word_set: # dp[j] 且 s[j:i] 在字典中
                    dp[i] = True # s[0:i] 可拆分
                    break # 找到一种拆分即可
        return dp[len(s)]
```

---

### 87. 最长递增子序列（中等）

**题目描述：** 找出最长严格递增子序列的长度（不要求连续）。

**解题思路：** `tails` 数组：`tails[i]` 表示长度为 i+1 的递增子序列的最小尾元素。二分查找更新 tails。O(nlogn)。

**记忆点：**
- **口诀**：能加尾就加长，不能就替换更小的尾
- **模板**：动态规划 + 二分（模式 12）
- **复杂度**：O(nlogn) 时间 / O(n) 空间
- **坑**：tails 不是真正的 LIS，只是「每个长度的最小尾元素」，长度才对

**示例：**
> 输入：nums = [10,9,2,5,3,7,101,18]
> 输出：4 （[2,5,7,101] 或 [2,3,7,101]）

```java
class Solution {
    public int lengthOfLIS(int[] nums) {
        List<Integer> tails = new ArrayList<>(); // tails[i] = 长度为 i+1 的递增子序列的最小尾元素
        for (int num : nums) {
            int idx = Collections.binarySearch(tails, num);
            if (idx < 0) idx = -idx - 1; // binarySearch 返回 -(插入点)-1 如果没找到
            if (idx == tails.size()) tails.add(num); // num 比所有 tails 都大，扩展长度
            else tails.set(idx, num); // ★ 替换更小的尾元素
        }
        return tails.size(); // tails 的长度就是 LIS 长度
    }
}
```

```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        import bisect
        # tails[i] = 长度为 i+1 的递增子序列的最小尾元素
        # tails 本身是有序的，因此可以用二分查找
        tails = []
        for num in nums:
            # bisect_left：找到第一个 >= num 的位置
            # 如果 num 比所有 tails 都大，idx == len(tails)，扩展 tails
            # 否则，替换 tails[idx]：用更小的尾元素更新等长子序列
            # 替换不会影响当前 LIS 长度，但为未来更长的子序列铺路
            idx = bisect.bisect_left(tails, num)
            if idx == len(tails):
                tails.append(num)
            else:
                tails[idx] = num
        return len(tails)
```

---

### 88. 乘积最大子数组（中等）

**题目描述：** 找出乘积最大的连续子数组。

**解题思路：** 维护当前最大乘积 `curMax` 和最小乘积 `curMin`（因为负数乘以最小可能变最大）。遇到负数时交换两者。

**记忆点：**
- **口诀**：同时记最大和最小，遇负数先互换
- **模板**：动态规划（模式 12）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：负数让「最小×负数」变最大，所以必须同时维护 curMin 并在遇负时交换

**示例：**
> 输入：nums = [2,3,-2,4]
> 输出：6 （[2,3]）

```java
class Solution {
    public int maxProduct(int[] nums) {
        int curMax = nums[0], curMin = nums[0], result = nums[0];
        for (int i = 1; i < nums.length; i++) {
            if (nums[i] < 0) { // 遇到负数，最大值和最小值互换（负负得正）
                int tmp = curMax;
                curMax = curMin;
                curMin = tmp;
            }
            curMax = Math.max(nums[i], curMax * nums[i]); // ★ 延续 or 重启
            curMin = Math.min(nums[i], curMin * nums[i]); // 维护最小乘积（可能翻身变最大）
            result = Math.max(result, curMax);
        }
        return result;
    }
}
```

```python
class Solution:
    def maxProduct(self, nums: List[int]) -> int:
        cur_max = cur_min = result = nums[0]
        for num in nums[1:]:
            # 关键：遇到负数时，最大值和最小值互换
            # 因为 cur_max * 负数 → 变最小，cur_min * 负数 → 变最大
            # 不交换的话，cur_max = max(num, cur_max * num) 会丢失"负负得正"的情况
            if num < 0:
                cur_max, cur_min = cur_min, cur_max
            # 注意：cur_max/cur_min 都要与 num 自身比较（可以重新开始一个子数组）
            cur_max = max(num, cur_max * num)
            cur_min = min(num, cur_min * num)
            result = max(result, cur_max)
        return result
```

---

### 89. 分割等和子集（中等）

**题目描述：** 能否将数组分割成两个和相等的子集。

**解题思路：** 0-1 背包变形。若总和为奇数返回 false。转化为能否选出若干数使和等于 `sum/2`。`dp[j]` 表示能否凑出和为 j。

**记忆点：**
- **口诀**：能否凑出半和，就是 0-1 背包
- **模板**：动态规划（0-1 背包）（模式 12）
- **复杂度**：O(n·sum) 时间 / O(sum) 空间
- **坑**：总和奇数直接 false；内层 `j` 倒序遍历（0-1 背包防重复用）

**示例：**
> 输入：nums = [1,5,11,5]
> 输出：true （[1,5,5] 和 [11]）

```java
class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int num : nums) sum += num;
        if (sum % 2 != 0) return false; // 奇数总和无法平分
        int target = sum / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true; // 和为0总是可以
        for (int num : nums)
            for (int j = target; j >= num; j--) // 0/1背包：倒序防止重复使用
                dp[j] |= dp[j - num]; // ★ 0-1 背包倒序
        return dp[target];
    }
}
```

```python
class Solution:
    def canPartition(self, nums: List[int]) -> bool:
        total = sum(nums)
        if total % 2 != 0: return False # 奇数总和无法平分
        target = total // 2
        dp = [False] * (target + 1)
        dp[0] = True # 和为0总是可以
        for num in nums:
            for j in range(target, num - 1, -1): # 0/1背包：倒序防止重复使用
                dp[j] = dp[j] or dp[j - num] # dp[j] = dp[j] or dp[j-num]
        return dp[target]
```

---

## 十六、多维动态规划

### 91. 不同路径（中等）

**题目描述：** 在 m×n 网格中从左上角走到右下角的不同路径数（只能向右或向下）。

**解题思路：** DP：`dp[i][j] = dp[i-1][j] + dp[i][j-1]`。可优化为一维数组：`dp[j] += dp[j-1]`。

**记忆点：**

- **口诀**：格子的路 = 上格 + 左格
- **模板**：动态规划（多维）（模式 12）
- **复杂度**：O(mn) 时间 / O(n) 空间
- **坑**：第一行第一列都是 1；一维优化 `dp[j] += dp[j-1]`

**示例：**
> 输入：m = 3, n = 7
> 输出：28

```java
class Solution {
    public int uniquePaths(int m, int n) {
        int[] dp = new int[n];
        Arrays.fill(dp, 1); // 第一行全部只有一种路径
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                dp[j] += dp[j - 1]; // ★ 上格 + 左格 dp[j] 还没被改的时候 = 上一行的值（上方）；dp[j-1] 刚被改过 = 本行的值（左方
        return dp[n - 1];
    }
}
```

```python
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n # 第一行全部只有一种路径
        for _ in range(1, m):
            for j in range(1, n):
                dp[j] += dp[j - 1] # 1D DP: dp[j] = dp[j] + dp[j-1]（上方+左方）
        return dp[-1]
```

---

### 92. 最小路径和（中等）

**题目描述：** 找出网格从左上到右下的最小路径和（只能向右或向下）。

**解题思路：** DP：`dp[j] = min(dp[j], dp[j-1]) + grid[i][j]`。原地或一维数组。

**记忆点：**
- **口诀**：最小和 = 上/左取小 + 当前格
- **模板**：动态规划（多维）（模式 12）
- **复杂度**：O(mn) 时间 / O(n) 空间
- **坑**：第一行只能从左来，第一列只能从上来到，要先单独初始化

**示例：**
> 输入：grid = [[1,3,1],[1,5,1],[4,2,1]]
> 输出：7 （路径 1→3→1→1→1）

```java
class Solution {
    public int minPathSum(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[] dp = new int[n];
        dp[0] = grid[0][0];
        for (int j = 1; j < n; j++) dp[j] = dp[j - 1] + grid[0][j]; // 第一行只能从左边来
        for (int i = 1; i < m; i++) {
            dp[0] += grid[i][0]; // 第一列只能从上方来
            for (int j = 1; j < n; j++)
                dp[j] = Math.min(dp[j], dp[j - 1]) + grid[i][j]; // ★ 上/左取小 + 当前
        }
        return dp[n - 1];
    }
}
```

```python
class Solution:
    def minPathSum(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        dp = [0] * n
        dp[0] = grid[0][0]
        for j in range(1, n):
            dp[j] = dp[j - 1] + grid[0][j] # 第一行只能从左边来
        for i in range(1, m):
            dp[0] += grid[i][0] # 第一列只能从上方来
            for j in range(1, n):
                dp[j] = min(dp[j], dp[j - 1]) + grid[i][j] # 1D DP: 从上方或左方取最小
        return dp[-1]
```

---

### 93. 最长回文子串（中等）

**题目描述：** 找出字符串中最长的回文子串。

**解题思路：** 中心扩散法。从每个字符（或两个字符之间）向两边扩展。O(n^2) 时间，O(1) 空间。

**记忆点：**
- **口诀**：每个中心向两边扩，奇偶各试一次
- **模板**：中心扩散
- **复杂度**：O(n²) 时间 / O(1) 空间
- **坑**：回文分奇数中心（i,i）和偶数中心（i,i+1），都要试；起始位置 = `i-(len-1)/2`

**示例：**
> 输入：s = "babad"
> 输出："bab" （"aba" 也是正确答案）

```java
class Solution {
    public String longestPalindrome(String s) {
        int start = 0, maxLen = 0;
        for (int i = 0; i < s.length(); i++) {
            int len1 = expand(s, i, i); // ★ 奇数中心扩散
            int len2 = expand(s, i, i + 1); // 偶数长度回文，中心为两个字符之间
            int len = Math.max(len1, len2);
            if (len > maxLen) {
                maxLen = len;
                start = i - (len - 1) / 2; // 根据中心和长度计算起始位置
            }
        }
        return s.substring(start, start + maxLen);
    }
    int expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--; r++; // 向两边扩展
        }
        return r - l - 1; // 实际回文长度
    }
}
```

```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        start, max_len = 0, 0
        for i in range(len(s)):
            for l, r in [(i, i), (i, i + 1)]: # 分别处理奇数长度和偶数长度回文
                while l >= 0 and r < len(s) and s[l] == s[r]:
                    l -= 1; r += 1 # 向两边扩展
                length = r - l - 1 # 实际回文长度
                if length > max_len:
                    max_len = length
                    start = l + 1 # 回文起始位置
        return s[start:start + max_len]
```

---

### 94. 最长公共子序列（中等）

**题目描述：** 求两个字符串的最长公共子序列长度（LCS）。

**解题思路：** DP：`dp[i][j]` = 若 `a[i-1]==b[j-1]` 则 `dp[i-1][j-1]+1`，否则 `max(dp[i-1][j], dp[i][j-1])`。可优化为一维数组 + 一个变量存左上角值。

**记忆点：**
- **口诀**：相等对角 +1，不等取上/左最大
- **模板**：动态规划（多维）（模式 12）
- **复杂度**：O(mn) 时间 / O(n) 空间
- **坑**：一维优化必须用 `prev` 保存对角线值（dp[i-1][j-1]），否则被覆盖

**示例：**
> 输入：text1 = "abcde", text2 = "ace"
> 输出：3 （"ace"）

```java
class Solution {
    public int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length(), n = text2.length();
        int[] dp = new int[n + 1]; // 1D DP 优化
        for (int i = 1; i <= m; i++) {
            int prev = 0; // 存 dp[i-1][j-1]（对角线值）
            for (int j = 1; j <= n; j++) {
                int temp = dp[j]; // 保存旧的 dp[j] 作为下一列的 prev
                if (text1.charAt(i - 1) == text2.charAt(j - 1))
                    dp[j] = prev + 1; // ★ 相等对角 +1
                else
                    dp[j] = Math.max(dp[j], dp[j - 1]); // 不匹配取上方或左方的最大值
                prev = temp; // 更新 prev
            }
        }
        return dp[n];
    }
}
```

```python
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [0] * (n + 1) # 1D DP 优化
        for i in range(1, m + 1):
            prev = 0  # dp[i-1][j-1]（对角线值）
            for j in range(1, n + 1):
                temp = dp[j] # 保存旧的 dp[j] 作为下一列的 prev
                if text1[i - 1] == text2[j - 1]:
                    dp[j] = prev + 1 # 匹配时从对角线+1
                else:
                    dp[j] = max(dp[j], dp[j - 1]) # 不匹配取上方或左方的最大值
                prev = temp # 更新 prev
        return dp[n]
```

---

### 95. 编辑距离（中等）

**题目描述：** 将 word1 转换为 word2 的最少操作数（插入/删除/替换）。

**解题思路：** DP：若 `w1[i-1]==w2[j-1]` 则 `dp[i][j]=dp[i-1][j-1]`；否则 `dp[i][j]=1+min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])`。

**记忆点：**
- **口诀**：相等不操作，不等取删/插/换最小 +1
- **模板**：动态规划（多维）（模式 12）
- **复杂度**：O(mn) 时间 / O(n) 空间
- **坑**：三个来源：`dp[j]`=删、`dp[j-1]`=插、`prev`=换；初始化 `dp[j]=j`（全删）

**示例：**
> 输入：word1 = "horse", word2 = "ros"
> 输出：3 （horse→rorse→rose→ros）

```java
class Solution {
    public int minDistance(String word1, String word2) {
        int m = word1.length(), n = word2.length();
        // 1D DP：dp[j] 表示 word1[0..i) → word2[0..j) 的最小编辑距离
        int[] dp = new int[n + 1];
        // 初始化第一行：word1 为空串，要变成 word2[0..j) 只能逐个插入，dp[j]=j
        for (int j = 0; j <= n; j++) dp[j] = j;
        for (int i = 1; i <= m; i++) {
            int prev = dp[0]; // 保存 dp[i-1][j-1]（对角线值）
            dp[0] = i;        // 第一列：word1[0..i) 变成空串只能逐个删除，dp[0]=i
            for (int j = 1; j <= n; j++) {
                int temp = dp[j]; // 保存更新前的 dp[j]（即 dp[i-1][j]），下一轮作为 prev
                if (word1.charAt(i - 1) == word2.charAt(j - 1))
                    dp[j] = prev; // 当前字符相等：无需操作，继承左上角
                else
                    // 三个来源各对应一种操作，取最小 +1：
                    // dp[j]   = dp[i-1][j]   → 删除 word1[i-1]
                    // dp[j-1] = dp[i][j-1]   → 插入 word2[j-1]
                    // prev    = dp[i-1][j-1] → 替换 word1[i-1] 为 word2[j-1]
                    dp[j] = 1 + Math.min(Math.min(dp[j], dp[j - 1]), prev); // ★ 删/插/换取最小 +1
                prev = temp; // 更新 prev 为下一列的"左上角"
            }
        }
        return dp[n];
    }
}
```

```python
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = list(range(n + 1))  # dp[j] 对应二维 dp[i][j]
        for i in range(1, m + 1):
            # prev 存储二维 DP 中的 dp[i-1][j-1]（左上角/对角线值）
            # 因为 1D 滚动数组只保留上一行，prev 需要在更新前单独保存
            prev = dp[0]  # 初始时 prev = dp[i-1][0]（上一行的第0列）
            dp[0] = i      # 更新 dp[i][0] = i
            for j in range(1, n + 1):
                temp = dp[j]           # 保存旧的 dp[j]（即 dp[i-1][j]），下一轮它就是 prev
                if word1[i - 1] == word2[j - 1]:
                    dp[j] = prev       # 字符相等：不需要操作，取对角线值
                else:
                    # dp[j]   → dp[i-1][j]   (删除)
                    # dp[j-1] → dp[i][j-1]   (插入)
                    # prev    → dp[i-1][j-1] (替换)
                    dp[j] = 1 + min(dp[j], dp[j - 1], prev)
                prev = temp  # 更新 prev 为下一列的"左上角"
        return dp[n]
```

---

## 十七、技巧

### 96. 只出现一次的数字（简单）

**题目描述：** 找出数组中只出现一次的数字（其余都出现两次）。

**解题思路：** 异或。`a ^ a = 0`，`a ^ 0 = a`。所有元素异或后即为只出现一次的数。

**记忆点：**
- **口诀**：全员异或，成对抵消
- **模板**：异或（模式 14）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：`a^a=0`、`a^0=a`、满足交换结合律，顺序无所谓

**示例：**

> 输入：nums = [2,2,1]
> 输出：1

```java
class Solution {
    public int singleNumber(int[] nums) {
        int res = 0;
        for (int num : nums) res ^= num; // ★ 全员异或抵消
        return res;
    }
}
```

```python
class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        res = 0
        for num in nums:
            res ^= num # XOR 性质：a^a=0，a^0=a，出现两次的互相抵消
        return res
```

---

### 97. 多数元素（简单）

**题目描述：** 找出出现次数 > n/2 的元素。

**解题思路：** Boyer-Moore 投票算法。维护候选人和计数器。遇相同数则 count++，遇不同则 count--；count=0 时换候选人。最终候选人即多数元素。

**记忆点：**
- **口诀**：相同 +1 不同 -1，归零换人
- **模板**：Boyer-Moore 投票（模式 14）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：多数元素 >n/2，所以最后存活的一定是它；`count==0` 时先换候选人

**示例：**

> 输入：nums = [3,2,3]
> 输出：3

```java
class Solution {
    public int majorityElement(int[] nums) {
        int candidate = 0, count = 0;
        for (int num : nums) {
            if (count == 0) candidate = num; // 票数归零，换候选人
            count += (num == candidate) ? 1 : -1; // ★ 相同 +1 不同 -1
        }
        return candidate; // 多数元素最终一定存活
    }
}
```

```python
class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        candidate, count = 0, 0
        for num in nums:
            if count == 0:
                candidate = num # 票数归零，换候选人
            count += 1 if num == candidate else -1 # Boyer-Moore 投票：相同+1，不同抵消
        return candidate # 多数元素最终一定存活
```

---

### 98. 颜色分类（中等）

**题目描述：** 对仅含 0/1/2 的数组原地排序（荷兰国旗问题）。

**解题思路：** 三指针。`p0`（0的边界）、`p2`（2的边界）、`i`（当前）。`nums[i]=0`则与 p0 交换，`nums[i]=2`则与 p2 交换，`nums[i]=1`则 i++。

**记忆点：**
- **口诀**：0 换前面，2 换后面，1 原地过
- **模板**：三指针（荷兰国旗）（模式 14）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：换 0 后 `i++`（换来的已处理），换 2 后 `i` 不能前进（换来的未知）

**示例：**

> 输入：nums = [2,0,2,1,1,0]
> 输出：[0,0,1,1,2,2]

```java
class Solution {
    public void sortColors(int[] nums) {
        int p0 = 0, p2 = nums.length - 1, i = 0;
        while (i <= p2) {
            if (nums[i] == 0) { // ★ 0 换前面
                swap(nums, i, p0);
                p0++; i++; // 与p0交换过来的数已经处理过，放心i++
            } else if (nums[i] == 2) {
                swap(nums, i, p2);
                p2--; // 与p2交换过来的数未知，i不能前进
            } else {
                i++;
            }
        }
    }
    void swap(int[] nums, int a, int b) {
        int tmp = nums[a];
        nums[a] = nums[b];
        nums[b] = tmp;
    }
}
```

```python
class Solution:
    def sortColors(self, nums: List[int]) -> None:
        p0, p2, i = 0, len(nums) - 1, 0 # 荷兰国旗三指针：p0放0，p2放2，i遍历
        while i <= p2:
            if nums[i] == 0:
                nums[i], nums[p0] = nums[p0], nums[i]
                p0 += 1; i += 1 # 交换过来的数已处理过，i可以前进
            elif nums[i] == 2:
                nums[i], nums[p2] = nums[p2], nums[i]
                p2 -= 1  # 与p2交换过来的数未知，i不能前进
            else:
                i += 1 # 1 在正确位置，继续
```

---

### 99. 下一个排列（中等）

**题目描述：** 将数组原地修改为字典序中的下一个更大排列。

**解题思路：** ①从右向左找到第一个 `nums[i] < nums[i+1]` 的位置 i；②在 i 右侧找比 nums[i] 大的最小元素并交换；③反转 i+1 到末尾。若找不到 i，整个数组反转。

**记忆点：**
- **口诀**：找降点 → 找交换 → 反后缀，三步走
- **模板**：下一个排列（模式 14）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：找不到下降点说明已最大，直接反转整个数组；交换后后缀仍降序，反转即最小

**示例：**
> 输入：nums = [1,2,3]
> 输出：[1,3,2]

```java
class Solution {
    public void nextPermutation(int[] nums) {
        // 步骤1：从右向左找第一个「下降点」i（nums[i] < nums[i+1]）
        // 找到它意味着：i 左侧保持不动，调整 i 及右侧即可得到下一个更大排列
        int i = nums.length - 2;
        while (i >= 0 && nums[i] >= nums[i + 1]) i--; // ★ 找第一个下降点
        if (i >= 0) {
            // 步骤2：在 i 右侧从右向左找第一个 > nums[i] 的元素 j
            // 它是右侧「大于 nums[i] 的最小元素」，与它交换能让排列恰好变大
            int j = nums.length - 1;
            while (j > i && nums[j] <= nums[i]) j--;
            swap(nums, i, j); // 交换
        }
        // 步骤3：反转 i+1 到末尾
        // 交换后 i+1 之后仍是降序（由下降点的定义保证），
        // 反转成升序 → 得到字典序最小的后缀，即「下一个排列」
        // 若找不到下降点（i=-1），整段反转即得最小排列
        reverse(nums, i + 1, nums.length - 1);
    }
    void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    void reverse(int[] a, int l, int r) {
        while (l < r) swap(a, l++, r--);
    }
}
```

```python
class Solution:
    def nextPermutation(self, nums: List[int]) -> None:
        # 步骤1: 从右向左找第一个下降点 i（nums[i] < nums[i+1]）
        # 如果找不到（i == -1），说明数组是降序的，直接反转整个数组
        i = len(nums) - 2
        while i >= 0 and nums[i] >= nums[i + 1]:
            i -= 1
        if i >= 0:
            # 步骤2: 在 i 右侧找比 nums[i] 大的最小元素（从右向左找第一个 > nums[i] 的）
            j = len(nums) - 1
            while j > i and nums[j] <= nums[i]:
                j -= 1
            nums[i], nums[j] = nums[j], nums[i]
        # 步骤3: 反转 i+1 到末尾
        # 为什么反转？交换后 i+1 到末尾仍是降序的（从右向左第一个上升点保证的）
        # 要让排列变成"下一个"，需要让后半段变成最小的升序排列 → 反转即可
        l, r = i + 1, len(nums) - 1
        while l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1; r -= 1
```

---

### 100. 寻找重复数（中等）

**题目描述：** 在 n+1 个数（取值 1~n）中找唯一的重复数，O(1) 额外空间。

**解题思路：** 快慢指针（环形链表 II 思路）。将数组值视为 next 指针，因为至少存在一个重复数所以一定有环。先找到相遇点，再从头和相遇点各走一步相遇即为重复数。

**记忆点：**
- **口诀**：数组当链表，重复数是环入口，快慢两次相遇
- **模板**：Floyd 判圈（模式 2）
- **复杂度**：O(n) 时间 / O(1) 空间
- **坑**：把 `nums[i]` 当 `i→nums[i]` 的指针；重复数 = 环入口；不修改原数组

**示例：**

> 输入：nums = [1,3,4,2,2]
> 输出：2

```java
class Solution {
    /**
     * 寻找数组中的重复数字（LeetCode 287）
     * 
     * 核心思路：将数组下标与值映射为链表关系，利用 Floyd 判圈算法找环入口。
     * 前提条件：数组长度为 n+1，元素值域为 [1, n]，恰好有一个数字重复出现。
     * 时间复杂度 O(n)，空间复杂度 O(1)，不修改原数组。
     */
    public int findDuplicate(int[] nums) {
        // ========== 第一阶段：Floyd 判圈，检测是否存在环并找到相遇点 ==========
        // 将数组抽象为隐式链表：下标 i 指向 nums[i]，即 i → nums[i]
        // 因为存在重复数字，必然有两个不同下标指向同一个值，形成环
        // slow 每次走一步，fast 每次走两步，若有环则必在环内某处相遇
        int slow = nums[0];       // 慢指针从起点出发，初始值为 nums[0]（即第一条边）
        int fast = nums[0];       // 快指针同样从起点出发
        do {
            slow = nums[slow];           // ★ 慢指针走一步：当前节点 → nums[当前节点]
            fast = nums[nums[fast]];     // 快指针走两步：当前节点 → nums[当前节点] → nums[nums[当前节点]]
        } while (slow != fast);          // 当两指针相遇时停止，此时一定在环内

        // ========== 第二阶段：寻找环的入口节点（即重复的数字） ==========
        // 数学证明：设起点到环入口距离为 a，环入口到相遇点距离为 b，环长为 c
        // 相遇时 slow 走了 a+b 步，fast 走了 a+b+k*c 步，且 fast=2*slow
        // 可得 a = k*c - b，即从起点走 a 步 == 从相遇点再走 (k*c-b) 步，都到达环入口
        // 因此让一个指针从起点出发、另一个从相遇点出发，同速前进，再次相遇点即为环入口
        int p = nums[0];                 // 指针 p 从链表起点（nums[0]）重新出发
        while (p != slow) {              // p 和 slow 同步每次走一步
            p = nums[p];                 // p 沿链表移动
            slow = nums[slow];           // slow 从相遇点继续沿环移动
        }
        // 两者再次相遇的位置就是环的入口，对应数组中重复的那个数字
        return p;
    }
}
```

```python
class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        # 将数组视为链表：nums[i] 表示从节点 i 指向节点 nums[i] 的指针
        # 因为有重复数，至少两个节点指向同一个节点 → 形成环
        # 重复数就是环的入口（环形链表 II 的 Floyd 判圈算法）
        slow = fast = nums[0]
        # 阶段1: 快慢指针找相遇点（环内任意一点）
        while True:
            slow = nums[slow]          # 走一步
            fast = nums[nums[fast]]    # 走两步
            if slow == fast:
                break
        # 阶段2: 从头和相遇点同时出发，相遇点就是环入口（重复数）
        # 数学证明：head到环入口 = 相遇点到环入口
        p = nums[0]
        while p != slow:
            p = nums[p]
            slow = nums[slow]
        return p
```

---

> 本文档共 88 题（简单 20 题 + 中等 68 题），为 LeetCode Hot 100 中简单与中等难度的全部题目，已排除 12 道困难题。按算法分类整理，每题只给出一种最适合面试记忆和理解的方法，并附 Java 和 Python 实现。
