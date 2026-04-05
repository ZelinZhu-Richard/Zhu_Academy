const DIFFICULTY_CALIBRATION = {
  introductory: `Difficulty: INTRODUCTORY. Assume no prior knowledge of this subject. Use plain, accessible language. Focus on foundational building blocks that a beginner must grasp first. Formulas should be simple — avoid calculus notation. Descriptions should define terms rather than assume familiarity.`,
  intermediate: `Difficulty: INTERMEDIATE. Assume the learner has basic familiarity with the subject area. Include standard formulas and show how concepts interconnect. Descriptions can reference prerequisite ideas without re-explaining them. Use standard mathematical notation.`,
  advanced: `Difficulty: ADVANCED. Assume strong foundations in the subject. Include derivations, limiting cases, and connections to adjacent fields. Use precise mathematical notation. Descriptions should address subtleties, common misconceptions at this level, and boundary conditions.`,
};

export function buildGenerateConceptGraphPrompt(topic, difficulty = 'intermediate') {
  const calibration = DIFFICULTY_CALIBRATION[difficulty] || DIFFICULTY_CALIBRATION.intermediate;

  return `You are a curriculum architect. Your task is to build a knowledge dependency graph for the topic: "${topic}".

This is NOT a list of chapter titles. It is a directed graph where each edge represents a real conceptual dependency — meaning one concept is required to understand or derive another. The graph should reveal the deep structure of how ideas in this subject actually depend on each other.

${calibration}

Generate 8 to 15 concept nodes and the edges that connect them.

Return a single JSON object with this exact structure. Every field is required on every node.

{
  "nodes": [
    {
      "id": "kebab-case-unique-id",
      "label": "Human-Readable Name",
      "description": "1-2 sentences explaining this concept at the appropriate difficulty level.",
      "depth": 0,
      "parentId": null,
      "connections": ["id-of-related-node-1", "id-of-related-node-2"],
      "expanded": false,
      "mastery": 0.0,
      "practiceProblems": [],
      "formula": "Key formula in plain text/unicode, e.g. 'F = ma', or null if not applicable",
      "mistakes": [],
      "lastReviewed": null,
      "nodeType": "concept"
    }
  ],
  "edges": [
    {
      "id": "e-source-id-target-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "One phrase explaining WHY this dependency exists"
    }
  ]
}

Rules for nodes:
- "id" must be kebab-case and unique across all nodes.
- "connections" is a list of IDs of conceptually related nodes (bidirectional — if A lists B, B should list A).
- "nodeType" should be "concept" for most nodes. Use "formula" only for nodes whose primary content IS a mathematical relationship (e.g., "Work-Energy Theorem" whose essence is W = ΔKE).
- "formula" should be non-null for at least 60% of nodes. Use plain text with unicode symbols (e.g., "τ = Iα", "∫F·dx = ΔKE", "p = mv"). Set to null only for purely qualitative concepts.
- "depth", "parentId", "mastery", "expanded", "practiceProblems", "mistakes", "lastReviewed" must use exactly the default values shown above. Do not vary them.

Rules for edges:
- Every edge MUST represent a genuine conceptual dependency. The "source" concept is needed to understand the "target" concept.
- The "label" must explain the specific reason for the dependency.
- BAD edge: "forces" → "energy" with label "both are physics topics". This is a category association, not a dependency.
- GOOD edge: "newtons-second-law" → "work-energy-theorem" with label "Work is defined as force applied over displacement — F=ma is needed to derive W=∫F·dx".
- GOOD edge: "angular-velocity" → "centripetal-acceleration" with label "Centripetal acceleration a=ω²r is derived from the rate of change of the velocity vector in circular motion".
- Edge IDs must follow the pattern "e-{source}-{target}".
- Every source and target must be an ID that exists in the nodes array.
- Aim for a connected graph — every node should have at least one incoming or outgoing edge. Isolated nodes are useless.

Return ONLY the JSON object. No markdown formatting, no code fences, no commentary before or after.`;
}
