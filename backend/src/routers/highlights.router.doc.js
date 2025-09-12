/**
 * @swagger
 * tags:
 *   name: Highlights
 *   description: PDF highlight management and annotations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Highlight:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f1a2b3c4d5e6f7g8h9i0j1
 *         user_id:
 *           type: string
 *           example: 64f1a2b3c4d5e6f7g8h9i0j1
 *         document_id:
 *           type: string
 *           example: 64f1a2b3c4d5e6f7g8h9i0j1
 *         file_hash:
 *           type: string
 *           example: abc123def456ghi789
 *         content:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *               example: "This is the highlighted text from the PDF"
 *         position:
 *           type: object
 *           properties:
 *             boundingRect:
 *               type: object
 *               properties:
 *                 x1:
 *                   type: number
 *                   example: 100
 *                 y1:
 *                   type: number
 *                   example: 200
 *                 x2:
 *                   type: number
 *                   example: 300
 *                 y2:
 *                   type: number
 *                   example: 250
 *                 width:
 *                   type: number
 *                   example: 200
 *                 height:
 *                   type: number
 *                   example: 50
 *             rects:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   x1:
 *                     type: number
 *                     example: 100
 *                   y1:
 *                     type: number
 *                     example: 200
 *                   x2:
 *                     type: number
 *                     example: 300
 *                   y2:
 *                     type: number
 *                     example: 250
 *                   width:
 *                     type: number
 *                     example: 200
 *                   height:
 *                     type: number
 *                     example: 50
 *             pageNumber:
 *               type: number
 *               example: 1
 *         comment:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *               example: "This is an important concept"
 *             emoji:
 *               type: string
 *               example: "💡"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["important", "review"]
 *         source_tag:
 *           type: string
 *           example: "manual"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     CreateHighlightRequest:
 *       type: object
 *       required:
 *         - document_id
 *         - file_hash
 *         - content
 *         - position
 *       properties:
 *         document_id:
 *           type: string
 *           example: 64f1a2b3c4d5e6f7g8h9i0j1
 *         file_hash:
 *           type: string
 *           example: abc123def456ghi789
 *         content:
 *           type: object
 *           required:
 *             - text
 *           properties:
 *             text:
 *               type: string
 *               minLength: 1
 *               maxLength: 1000
 *               example: "This is the highlighted text from the PDF"
 *         position:
 *           type: object
 *           required:
 *             - boundingRect
 *             - rects
 *           properties:
 *             boundingRect:
 *               type: object
 *               required:
 *                 - x1
 *                 - y1
 *                 - x2
 *                 - y2
 *                 - width
 *                 - height
 *               properties:
 *                 x1:
 *                   type: number
 *                   example: 100
 *                 y1:
 *                   type: number
 *                   example: 200
 *                 x2:
 *                   type: number
 *                   example: 300
 *                 y2:
 *                   type: number
 *                   example: 250
 *                 width:
 *                   type: number
 *                   example: 200
 *                 height:
 *                   type: number
 *                   example: 50
 *             rects:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - x1
 *                   - y1
 *                   - x2
 *                   - y2
 *                   - width
 *                   - height
 *                 properties:
 *                   x1:
 *                     type: number
 *                     example: 100
 *                   y1:
 *                     type: number
 *                     example: 200
 *                   x2:
 *                     type: number
 *                     example: 300
 *                   y2:
 *                     type: number
 *                     example: 250
 *                   width:
 *                     type: number
 *                     example: 200
 *                   height:
 *                     type: number
 *                     example: 50
 *             pageNumber:
 *               type: number
 *               example: 1
 *         comment:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *               maxLength: 1000
 *               example: "This is an important concept"
 *             emoji:
 *               type: string
 *               maxLength: 10
 *               example: "💡"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["important", "review"]
 *         source_tag:
 *           type: string
 *           maxLength: 50
 *           example: "manual"
 *
 *     UpdateHighlightRequest:
 *       type: object
 *       properties:
 *         content:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *               minLength: 1
 *               maxLength: 1000
 *               example: "Updated highlight text"
 *         comment:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *               maxLength: 1000
 *               example: "Updated comment"
 *             emoji:
 *               type: string
 *               maxLength: 10
 *               example: "🔥"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["updated", "important"]
 *         source_tag:
 *           type: string
 *           maxLength: 50
 *           example: "updated"
 *
 *     HighlightResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Highlight'
 *         message:
 *           type: string
 *           example: "Highlight created successfully"
 *
 *     HighlightsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Highlight'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 25
 *             pages:
 *               type: integer
 *               example: 3
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Validation Error"
 *         message:
 *           type: string
 *           example: "Please check your input data"
 *         details:
 *           type: array
 *           items:
 *             type: object
 *           example: [{"field": "content.text", "message": "Highlight text is required"}]
 */

/**
 * @swagger
 * /api/highlights:
 *   post:
 *     summary: Create a new highlight
 *     tags: [Highlights]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHighlightRequest'
 *     responses:
 *       201:
 *         description: Highlight created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HighlightResponse'
 *       400:
 *         description: Validation error or creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/highlights/document/{documentId}:
 *   get:
 *     summary: Get highlights for a document
 *     tags: [Highlights]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *         example: 64f1a2b3c4d5e6f7g8h9i0j1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of highlights per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter highlights by text content
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter highlights by tags
 *     responses:
 *       200:
 *         description: Highlights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HighlightsListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/highlights/file/{fileHash}:
 *   get:
 *     summary: Get highlights for a file
 *     tags: [Highlights]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileHash
 *         required: true
 *         schema:
 *           type: string
 *         description: File hash
 *         example: abc123def456ghi789
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of highlights per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter highlights by text content
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter highlights by tags
 *     responses:
 *       200:
 *         description: Highlights retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HighlightsListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/highlights/search:
 *   get:
 *     summary: Search highlights by text
 *     tags: [Highlights]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "important concept"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of highlights per page
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter highlights by tags
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HighlightsListResponse'
 *       400:
 *         description: Invalid search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/highlights/{highlightId}:
 *   get:
 *     summary: Get a single highlight
 *     tags: [Highlights]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: highlightId
 *         required: true
 *         schema:
 *           type: string
 *         description: Highlight ID
 *         example: 64f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Highlight retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HighlightResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Highlight not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Highlight Not Found"
 *                 message:
 *                   type: string
 *                   example: "Highlight not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Update a highlight
 *     tags: [Highlights]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: highlightId
 *         required: true
 *         schema:
 *           type: string
 *         description: Highlight ID
 *         example: 64f1a2b3c4d5e6f7g8h9i0j1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHighlightRequest'
 *     responses:
 *       200:
 *         description: Highlight updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HighlightResponse'
 *       400:
 *         description: Validation error or update failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Highlight not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Highlight Not Found"
 *                 message:
 *                   type: string
 *                   example: "Highlight not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Delete a highlight
 *     tags: [Highlights]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: highlightId
 *         required: true
 *         schema:
 *           type: string
 *         description: Highlight ID
 *         example: 64f1a2b3c4d5e6f7g8h9i0j1
 *     responses:
 *       200:
 *         description: Highlight deleted successfully
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
 *                   example: "Highlight deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Highlight not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Highlight Not Found"
 *                 message:
 *                   type: string
 *                   example: "Highlight not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
