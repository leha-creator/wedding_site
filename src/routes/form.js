/**
 * Form CRUD API: get and delete user submission by user_id.
 */

const express = require('express');
const router = express.Router();
const submissions = require('../services/submissions');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const log = {
  debug: (msg, data) =>
    ['debug'].includes(LOG_LEVEL) && console.log('[form]', msg, data !== undefined ? data : ''),
  info: (msg, data) =>
    ['debug', 'info'].includes(LOG_LEVEL) && console.log('[form]', msg, data !== undefined ? data : ''),
  warn: (msg, data) =>
    ['debug', 'info', 'warn'].includes(LOG_LEVEL) &&
    console.warn('[form] WARN', msg, data !== undefined ? data : ''),
};

function isValidUserId(id) {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  log.debug('GET /form/:userId', { userId });

  if (!isValidUserId(userId)) {
    log.warn('Invalid user_id format', { userId });
    return res.status(400).json({ error: 'Invalid user_id format' });
  }

  try {
    const data = submissions.getByUserId(userId);
    if (!data) {
      log.info('Submission not found', { userId });
      return res.status(404).json({ error: 'Not found' });
    }
    log.info('GET submission', { userId });
    res.json(data);
  } catch (err) {
    console.error('[form] ERROR', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:userId', (req, res) => {
  const { userId } = req.params;
  log.debug('DELETE /form/:userId', { userId });

  if (!isValidUserId(userId)) {
    log.warn('Invalid user_id format', { userId });
    return res.status(400).json({ error: 'Invalid user_id format' });
  }

  try {
    const deleted = submissions.deleteByUserId(userId);
    log.info(deleted ? 'Deleted submission' : 'No submission to delete', { userId });
    res.json({ success: deleted });
  } catch (err) {
    console.error('[form] ERROR', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
