const express = require('express');
const router = express.Router();
const Issue = require('../models/issue');
const { v4: uuidv4 } = require('uuid');

// POST - Create a new issue
router.post('/issues', async (req, res) => {
    try {
        const newIssue = new Issue({
            id: uuidv4(), // Generate unique ID
            ...req.body,
            type: 'new'
        });

        const savedIssue = await newIssue.save();
        res.status(201).json(savedIssue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET - Get all issues
router.get('/issues', async (req, res) => {
    try {
        const issues = await Issue.find();
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT - Update issue type to "resolved"
router.put('/issues/:id', async (req, res) => {
    try {
        
        const issue = await Issue.findOne({ id: req.params.id });
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        issue.type = 'resolved';
        const updatedIssue = await issue.save();
        res.json(updatedIssue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET /api/charts/severity
router.get('/charts/severity', async (req, res) => {
  try {
    const severityData = await Issue.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          label: '$_id', // Project _id to label
          count: 1,
          _id: 0, // Exclude _id from the final output
        },
      },
    ]);

    // Convert to the format Chart.js expects
    const labels = severityData.map(item => item.label);
    const data = severityData.map(item => item.count);

    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/charts/status
router.get('/charts/status', async (req, res) => {
  try {
    const statusData = await Issue.aggregate([
      {
        $group: {
          _id: '$type', // Assuming 'type' field stores 'new' or 'resolved'
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          label: '$_id', // Project _id to label
          count: 1,
          _id: 0 // Exclude _id from the final output
        },
      },
    ]);

    // Convert to the format Chart.js expects
    const labels = statusData.map(item => item.label);
    const data = statusData.map(item => item.count);

    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/charts/timeline
// GET /api/charts/timeline
router.get('/charts/timeline', async (req, res) => {
  try {
    const timelineData = await Issue.aggregate([
      {
        $match: { type: 'resolved' } // Only consider resolved issues
      },
      {
        $group: {
          _id: {
            assignee: '$name', // Assuming 'name' field stores assignee name
            day: { $dayOfMonth: '$updatedAt' }, // Extract day from updatedAt
            month: { $month: '$updatedAt' }, // Extract month from updatedAt
            year: { $year: '$updatedAt' }  // Extract year from updatedAt
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1
        }
      },
      {
        $group: {
          _id: '$_id.assignee',
          data: {
            $push: {
              day: '$_id.day',
              month: '$_id.month',
              year: '$_id.year',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          label: '$_id', // Use assignee as label
          data: 1,
          _id: 0
        }
      }
    ]);

    // Transform data for Chart.js
    const formattedData = {
      labels: [],
      datasets: []
    };

    const dayMonthYearLabels = new Set(); // Use a Set to avoid duplicate day-month-year labels

    timelineData.forEach(assigneeData => {
      const dataset = {
        label: assigneeData.label,
        data: [],
        borderColor: getRandomColor(), // Use the getRandomColor() helper function
        fill: false
      };

      assigneeData.data.forEach(item => {
        const dayMonthYear = `${item.year}-${String(item.month).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`; // e.g., "2023-12-20"
        dayMonthYearLabels.add(dayMonthYear);
        dataset.data.push({ x: dayMonthYear, y: item.count }); // Add data point with x (date) and y (count)
      });

      formattedData.datasets.push(dataset);
    });

    formattedData.labels = Array.from(dayMonthYearLabels).sort(); // Sort labels chronologically

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET /api/charts/assignee
router.get('/charts/assignee', async (req, res) => {
  try {
    const assigneeData = await Issue.aggregate([
      {
        $group: {
          _id: '$name', // Assuming 'name' field stores assignee name
          resolvedCount: {
            $sum: { $cond: { if: { $eq: ['$type', 'resolved'] }, then: 1, else: 0 } }
          },
          newCount: {
            $sum: { $cond: { if: { $eq: ['$type', 'new'] }, then: 1, else: 0 } }
          }
        }
      },
      {
        $project: {
          label: '$_id', // Use assignee name as label
          resolvedCount: 1,
          newCount: 1,
          _id: 0
        }
      }
    ]);

    // Transform data for Chart.js
    const labels = assigneeData.map(item => item.label);
    const resolvedData = assigneeData.map(item => item.resolvedCount);
    const newData = assigneeData.map(item => item.newCount);

    res.json({
      labels,
      datasets: [
        {
          label: 'Resolved',
          data: resolvedData,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        },
        {
          label: 'New',
          data: newData,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to generate random colors (for line chart)
function getRandomColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

module.exports = router;