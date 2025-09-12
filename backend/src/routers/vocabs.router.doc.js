/**
 * @swagger
 * tags:
 *   name: Vocabularies
 *   description: Vocabulary management operations
 */

/**
 * @swagger
 * /api/vocabs:
 *   post:
 *     summary: Create new vocabulary entry
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - word
 *               - meaning
 *               - source
 *               - source_type
 *             properties:
 *               word:
 *                 type: string
 *                 description: The vocabulary word
 *                 example: serendipity
 *               meaning:
 *                 type: string
 *                 description: Meaning of the word
 *                 example: The occurrence of pleasant discoveries by accident
 *               pronunciation_url:
 *                 type: string
 *                 description: Pronunciation URL
 *                 example: https://forvo.com/word/serendipity
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for categorization
 *                 example: ["noun", "advanced"]
 *               source:
 *                 type: string
 *                 description: Source name or identifier
 *                 example: Cambridge Dictionary
 *               source_type:
 *                 type: string
 *                 enum: [document, package, self]
 *                 description: Source type of the vocabulary
 *                 example: self
 *               examples:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Example sentences
 *                 example: ["A pleasant serendipity occurred today."]
 *     responses:
 *       201:
 *         description: Vocabulary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vocabulary created successfully
 *                 data:
 *                   $ref: '#/components/schemas/VocabWithDocument'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/me:
 *   get:
 *     summary: Get user vocabularies with pagination and filtering
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *           default: 10
 *         description: Number of vocabularies per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in words and meanings
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: source_type
 *         schema:
 *           type: string
 *           enum: [document, package, self]
 *         description: Filter by source type
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created_at, word]
 *           default: created_at
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Vocabularies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/VocabWithDocument'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/{id}:
 *   get:
 *     summary: Get vocabulary by ID
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vocabulary ID
 *     responses:
 *       200:
 *         description: Vocabulary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/VocabWithDocument'
 *       404:
 *         description: Vocabulary not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/{id}:
 *   put:
 *     summary: Update vocabulary
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vocabulary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               word:
 *                 type: string
 *                 description: The vocabulary word
 *                 example: serendipity
 *               meaning:
 *                 type: string
 *                 description: Meaning of the word
 *                 example: The occurrence of pleasant discoveries by accident
 *               pronunciation_url:
 *                 type: string
 *                 description: Pronunciation URL
 *                 example: https://forvo.com/word/serendipity
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Tags for categorization
 *                 example: ["noun", "advanced"]
 *               source:
 *                 type: string
 *                 description: Source name or identifier
 *                 example: Cambridge Dictionary
 *               source_type:
 *                 type: string
 *                 enum: [document, package, self]
 *                 description: Source type of the vocabulary
 *                 example: self
 *               examples:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Example sentences
 *                 example: ["A pleasant serendipity occurred today."]
 *     responses:
 *       200:
 *         description: Vocabulary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vocabulary updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/VocabWithDocument'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vocabulary not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/{id}:
 *   delete:
 *     summary: Delete vocabulary
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vocabulary ID
 *     responses:
 *       200:
 *         description: Vocabulary deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vocabulary deleted successfully
 *       404:
 *         description: Vocabulary not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/admin/{id}:
 *   delete:
 *     summary: Delete any vocabulary (Admin only)
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vocabulary ID
 *     responses:
 *       200:
 *         description: Vocabulary deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vocabulary deleted successfully
 *       403:
 *         description: Access denied - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vocabulary not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/stats/{userId}:
 *   get:
 *     summary: Get vocabulary statistics for a specific user (Admin only)
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [all, week, month, year]
 *           default: all
 *         description: Time frame for statistics
 *     responses:
 *       200:
 *         description: User vocabulary statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of vocabularies
 *                       example: 150
 *                     totalReviews:
 *                       type: integer
 *                       description: Total number of reviews across all vocabularies
 *                       example: 450
 *                     avgReviewsPerVocab:
 *                       type: number
 *                       description: Average number of reviews per vocabulary
 *                       example: 3.0
 *                     bySourceType:
 *                       type: object
 *                       description: Count of vocabularies by source type
 *                       properties:
 *                         document:
 *                           type: integer
 *                           example: 75
 *                         package:
 *                           type: integer
 *                           example: 50
 *                         self:
 *                           type: integer
 *                           example: 25
 *                     weeklyBreakdown:
 *                       type: array
 *                       description: Weekly breakdown of vocabulary creation for current month
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               week:
 *                                 type: integer
 *                               year:
 *                                 type: integer
 *                           count:
 *                             type: integer
 *                     timeframe:
 *                       type: string
 *                       description: Time frame used for statistics
 *                       example: all
 *       403:
 *         description: Access denied - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/admin/overview:
 *   get:
 *     summary: Get all users vocabulary overview (Admin only)
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Users vocabulary overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439011
 *                       email:
 *                         type: string
 *                         example: user@example.com
 *                       total_vocabularies:
 *                         type: integer
 *                         example: 150
 *                       last_activity:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Access denied - Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/stats:
 *   get:
 *     summary: Get current user vocabulary statistics
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [all, week, month, year]
 *           default: all
 *         description: Time frame for statistics
 *     responses:
 *       200:
 *         description: Vocabulary statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of vocabularies
 *                       example: 150
 *                     totalReviews:
 *                       type: integer
 *                       description: Total number of reviews across all vocabularies
 *                       example: 450
 *                     avgReviewsPerVocab:
 *                       type: number
 *                       description: Average number of reviews per vocabulary
 *                       example: 3.0
 *                     bySourceType:
 *                       type: object
 *                       description: Count of vocabularies by source type
 *                       properties:
 *                         document:
 *                           type: integer
 *                           example: 75
 *                         package:
 *                           type: integer
 *                           example: 50
 *                         self:
 *                           type: integer
 *                           example: 25
 *                     weeklyBreakdown:
 *                       type: array
 *                       description: Weekly breakdown of vocabulary creation for current month
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               week:
 *                                 type: integer
 *                               year:
 *                                 type: integer
 *                           count:
 *                             type: integer
 *                     timeframe:
 *                       type: string
 *                       description: Time frame used for statistics
 *                       example: all
 *       400:
 *         description: Invalid timeframe parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/vocabs/{id}/review:
 *   post:
 *     summary: Record vocabulary review result
 *     tags: [Vocabularies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vocabulary ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correct
 *             properties:
 *               correct:
 *                 type: boolean
 *                 description: Whether the user answered correctly
 *                 example: true
 *     responses:
 *       200:
 *         description: Review recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Review recorded successfully
 *                 data:
 *                   $ref: '#/components/schemas/VocabWithDocument'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vocabulary not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     VocabWithDocument:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique vocabulary identifier
 *           example: 507f1f77bcf86cd799439011
 *         user_id:
 *           type: string
 *           description: Reference to user ID
 *           example: 507f1f77bcf86cd799439011
 *         word:
 *           type: string
 *           description: The vocabulary word
 *           example: serendipity
 *         meaning:
 *           type: string
 *           description: Meaning of the word
 *           example: The occurrence of pleasant discoveries by accident
 *         pronunciation_url:
 *           type: string
 *           description: Pronunciation URL
 *           example: https://forvo.com/word/serendipity
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorization
 *           example: ["noun", "advanced"]
 *         source:
 *           type: string
 *           description: Source identifier
 *           example: 507f1f77bcf86cd799439011
 *         source_type:
 *           type: string
 *           enum: [document, package, self]
 *           description: Type of source
 *           example: document
 *         examples:
 *           type: array
 *           items:
 *             type: string
 *           description: Example sentences
 *           example: ["Finding that book was pure serendipity."]
 *         review_history:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               correct:
 *                 type: boolean
 *                 example: true
 *               reviewed_at:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-09-10T10:30:00.000Z
 *           description: Review history
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: 2025-09-10T10:30:00.000Z
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: 2025-09-10T10:30:00.000Z
 *         document:
 *           type: object
 *           description: Document information (only present when source_type is 'document')
 *           properties:
 *             _id:
 *               type: string
 *               description: Document ID
 *               example: 507f1f77bcf86cd799439011
 *             file_name:
 *               type: string
 *               description: Document file name
 *               example: "IELTS_Listening_Practice.pdf"
 *             file_hash:
 *               type: string
 *               description: Document file hash
 *               example: "abc123def456..."
 *             created_at:
 *               type: string
 *               format: date-time
 *               description: Document creation timestamp
 *               example: 2025-09-10T09:00:00.000Z
 *           example:
 *             _id: "507f1f77bcf86cd799439011"
 *             file_name: "IELTS_Listening_Practice.pdf"
 *             file_hash: "abc123def456..."
 *             created_at: "2025-09-10T09:00:00.000Z"
 */
