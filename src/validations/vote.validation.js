const { z } = require('zod');

const idSchema = z
  .string()
  .min(1, "ID is required")
  .regex(/^\d+$/, "ID must be a numeric string")
  .transform((val) => parseInt(val, 10))
  .refine((val) => val > 0, "ID must be positive");

const voteOnPostSchema = z.object({
  params: z.object({
    postId: idSchema,
    commentId: z.undefined().optional()
  })
});

const voteOnCommentSchema = z.object({
  params: z.object({
    commentId: idSchema,
    postId: z.undefined().optional()
  })
});

module.exports = {
  voteOnPostSchema,
  voteOnCommentSchema,
};
