import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

function App() {
  const [meetings, setMeetings] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [form, setForm] = useState({ title: "", date: "", time: "", description: "", type: "" });
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState("All");

  const meetingTypes = ["Academic", "Business", "Leisure", "Sport", "Social", "Workshop", "Training"];

  useEffect(() => {
    fetch("/api/meetings")
      .then((response) => response.json())
      .then((data) => {
        setMeetings(data);
        setFilteredMeetings(data);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editId ? `/api/meetings/${editId}` : "/api/meetings";
    const method = editId ? "PUT" : "POST";

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((response) => response.json())
      .then(() => {
        setForm({ title: "", date: "", time: "", description: "", type: "" });
        setEditId(null);
        fetch("/api/meetings")
          .then((response) => response.json())
          .then((data) => {
            setMeetings(data);
            setFilteredMeetings(data);
          });
      });
  };

  const handleEdit = (meeting) => {
    setForm({
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      description: meeting.description,
      type: meeting.type,
    });
    setEditId(meeting.id);
  };

  const handleDelete = (id) => {
    fetch(`/api/meetings/${id}`, { method: "DELETE" }).then(() => {
      setMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
      setFilteredMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
    });
  };

  const handleFilterChange = (e) => {
    const selectedType = e.target.value;
    setFilterType(selectedType);

    if (selectedType === "All") {
      setFilteredMeetings(meetings);
    } else {
      setFilteredMeetings(meetings.filter((meeting) => meeting.type === selectedType));
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h3" align="center" gutterBottom>
        Meeting Manager
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Time"
              name="time"
              value={form.time}
              onChange={handleChange}
              required
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Meeting Type</InputLabel>
              <Select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                {meetingTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              {editId ? "Update" : "Add"} Meeting
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Filter Meetings by Type
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Filter</InputLabel>
          <Select value={filterType} onChange={handleFilterChange}>
            <MenuItem value="All">All</MenuItem>
            {meetingTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {filteredMeetings.map((meeting) => (
          <Grid item xs={12} sm={6} key={meeting.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{meeting.title}</Typography>
                <Typography color="textSecondary">
                  {meeting.date} at {meeting.time}
                </Typography>
                <Typography variant="body2">{meeting.description}</Typography>
                <Typography variant="caption">{meeting.type}</Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleEdit(meeting)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => handleDelete(meeting.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default App;
