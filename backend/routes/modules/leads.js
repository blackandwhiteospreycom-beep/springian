const express = require('express');
const router = express.Router();
const leadService = require('../../services/modules/leadService');
const { authenticate } = require('../../middleware/auth');

// Get all capture forms
router.get('/forms', authenticate, async (req, res) => {
    try {
        const forms = await leadService.getCaptureForms(req.user.org_id);
        res.json(forms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create capture form
router.post('/forms', authenticate, async (req, res) => {
    try {
        const form = await leadService.createCaptureForm(req.user.org_id, req.body);
        res.status(201).json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update capture form
router.put('/forms/:id', authenticate, async (req, res) => {
    try {
        const form = await leadService.updateCaptureForm(req.params.id, req.body);
        res.json(form);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete capture form
router.delete('/forms/:id', authenticate, async (req, res) => {
    try {
        await leadService.deleteCaptureForm(req.params.id);
        res.json({ message: 'Form deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit lead from form (Public endpoint)
router.post('/submit/:formId', async (req, res) => {
    try {
        const result = await leadService.submitLead(req.params.formId, req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
