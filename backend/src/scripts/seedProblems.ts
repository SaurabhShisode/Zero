import "dotenv/config";
import { connectDb } from "../config/db.js";
import { Problem } from "../models/Problem.js";
import { Skills } from "../models/common.js";

const samples: Record<string, Array<{ title: string; link: string; difficulty: string; companyTags?: string[] }>> = {
  DSA: [
    { title: "Two Sum", link: "https://leetcode.com/problems/two-sum/", difficulty: "Easy", companyTags: ["FAANG"] },
  ],
  SQL: [
    { title: "SQL Join Basics", link: "https://www.hackerrank.com/domains/sql", difficulty: "Easy", companyTags: ["Service"] },
  ],
  JavaScript: [
    { title: "Array Map Reduce Common", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map", difficulty: "Easy" },
  ],
  Java: [
    { title: "Binary Tree Traversal", link: "https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/", difficulty: "Medium" },
  ],
  SystemDesign: [
    { title: "Rate Limiter Design", link: "https://www.educative.io/courses/grokking-the-system-design-interview", difficulty: "Hard" },
  ],
  CSFundamentals: [
    { title: "Bit Manipulation Basics", link: "https://www.hackerrank.com/", difficulty: "Easy" },
  ],
};

const run = async () => {
  await connectDb();
  let created = 0;
  for (const skill of Skills) {
    const list = samples[skill as string] ?? [];
    for (const s of list) {
      const existing = await Problem.findOne({ link: s.link });
      if (!existing) {
        await Problem.create({ title: s.title, link: s.link, skill, difficulty: s.difficulty, companyTags: s.companyTags ?? [], cooldownDays: 14 });
        created++;
        // eslint-disable-next-line no-console
        console.log(`Created problem ${s.title}`);
      }
    }
  }
  // eslint-disable-next-line no-console
  console.log(`Seed done, created ${created} problems`);
  process.exit(0);
};

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed", err);
  process.exit(1);
});
