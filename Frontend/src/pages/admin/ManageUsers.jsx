import { useContext, useState, useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Pagination from "@mui/material/Pagination";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";

import api from "../../api/axios.js";
import { AppContext } from "../../context/AppContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import { TableSkeleton } from "../../components/SkeletonLoader.jsx";

const ITEMS_PER_PAGE = 8;
const AVAILABLE_ROLES = ["CUSTOMER", "HOST", "ADMIN"];

export default function ManageUsers() {
  const { adminUsers, adminUsersLoading, fetchAdminUsers, error } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, userName: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit Roles Dialog State
  const [roleDialog, setRoleDialog] = useState({ open: false, user: null, roles: [] });
  const [roleLoading, setRoleLoading] = useState(false);

  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Filter users by search
  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      const q = searchTerm.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });
  }, [adminUsers, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, page]);

  const handleOpenDelete = (user) => {
    setDeleteDialog({ open: true, userId: user._id, userName: user.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.userId) return;
    setDeleteLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      await api.delete(`/admin/users/${deleteDialog.userId}`);
      setFeedback({ type: "success", message: `User ${deleteDialog.userName} deleted successfully.` });
      setDeleteDialog({ open: false, userId: null, userName: "" });
      await fetchAdminUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Unable to delete user.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenRoleDialog = (user) => {
    setRoleDialog({
      open: true,
      user,
      roles: Array.isArray(user.roles) ? [...user.roles] : [],
    });
  };

  const handleRoleToggle = (role) => {
    setRoleDialog((prev) => {
      const exists = prev.roles.includes(role);
      const newRoles = exists
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles: newRoles };
    });
  };

  const handleSaveRoles = async () => {
    if (!roleDialog.user) return;
    setRoleLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await api.put(`/admin/users/${roleDialog.user._id}/roles`, {
        roles: roleDialog.roles,
      });
      setFeedback({
        type: "success",
        message: response.data?.message || "User roles updated successfully.",
      });
      setRoleDialog({ open: false, user: null, roles: [] });
      await fetchAdminUsers();
    } catch (err) {
      console.error("Error updating roles:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Unable to update user roles.",
      });
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <PageHeader
        title="Manage Users"
        subtitle="View all registered platform accounts, modify system permissions, and handle users."
        breadcrumbs={[{ label: "Admin Console", to: "/admin" }, { label: "Users" }]}
        action={
          <Button
            component={RouterLink}
            to="/admin"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Admin Console
          </Button>
        }
      />

      {feedback.message && (
        <Alert
          severity={feedback.type === "success" ? "success" : "error"}
          sx={{ mb: 3 }}
          onClose={() => setFeedback({ type: "", message: "" })}
        >
          {feedback.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3.5,
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search users by name or email address..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          slotProps={{ input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}}
        />
      </Paper>

      {/* Users Table */}
      {adminUsersLoading ? (
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E2E8F0", borderRadius: 3.5 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Assigned Roles</TableCell>
                  <TableCell>Joined Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableSkeleton rows={6} columns={5} />
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<PeopleIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />}
          title="No Users Found"
          description="No users matched your query. Try clearing your search."
          actionText="Clear Search"
          onAction={() => setSearchTerm("")}
        />
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: "1px solid #E2E8F0",
              overflowX: "auto",
            }}
          >
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell>Email Address</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Registered On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((u) => (
                  <TableRow key={u._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontWeight: 700 }}>
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {u.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {u.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                        {Array.isArray(u.roles) && u.roles.length > 0 ? (
                          u.roles.map((r) => (
                            <Chip
                              key={r}
                              label={r}
                              size="small"
                              color={r === "ADMIN" ? "secondary" : r === "HOST" ? "primary" : "default"}
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: "0.7rem", height: 22 }}
                            />
                          ))
                        ) : (
                          <Chip label="None" size="small" variant="outlined" sx={{ height: 22 }} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenRoleDialog(u)}
                        >
                          Roles
                        </Button>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenDelete(u)}
                          aria-label="Delete user"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, v) => setPage(v)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* Edit Roles Dialog */}
      <Dialog
        open={roleDialog.open}
        onClose={() => setRoleDialog({ open: false, user: null, roles: [] })}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3.5, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Manage Roles — {roleDialog.user?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign or remove permissions for this account:
          </Typography>
          <FormGroup>
            {AVAILABLE_ROLES.map((role) => (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox
                    checked={roleDialog.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {role}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setRoleDialog({ open: false, user: null, roles: [] })}
            disabled={roleLoading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRoles}
            disabled={roleLoading}
            variant="contained"
            color="primary"
          >
            {roleLoading ? "Saving..." : "Save Roles"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete User Account"
        content={`Are you sure you want to permanently delete user "${deleteDialog.userName}"? This cannot be undone.`}
        confirmText="Delete Account"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialog({ open: false, userId: null, userName: "" })}
      />
    </Container>
  );
}