import React from "react";
import {withSnackbar} from 'notistack';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import BlockIcon from "@material-ui/icons/Block";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import RefreshIcon from "@material-ui/icons/Refresh";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import PropTypes from "prop-types";
import CircularProgress from "@material-ui/core/CircularProgress";

class ViewerManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showConfirmDialog: false,
            selectedViewer: null,
            action: null,
            loading: false
        };
    }

    componentDidMount() {
        // Refresh viewer lists on mount
        this.handleRefresh();
    }

    handleConfirmDialogOpen = (viewer, action) => {
        this.setState({
            showConfirmDialog: true,
            selectedViewer: viewer,
            action: action
        });
    };

    handleConfirmDialogClose = () => {
        this.setState({
            showConfirmDialog: false,
            selectedViewer: null,
            action: null
        });
    };

    handleConfirmAction = async () => {
        const {selectedViewer, action} = this.state;

        if (!selectedViewer || !action) return;

        this.setState({loading: true});

        try {
            await this.props.onManageViewer(selectedViewer, action);

            const actionText = action === "approve"
                ? "approved"
                : action === "block"
                    ? "blocked"
                    : action === "unblock"
                        ? "unblocked"
                        : "removed";

            this.props.enqueueSnackbar(`Viewer ${actionText}`, {variant: "success"});
            this.handleRefresh();
        } catch (error) {
            console.error("Error updating viewer:", error);
            this.props.enqueueSnackbar("Failed to update viewer status", {variant: "error"});
        } finally {
            this.setState({loading: false});
        }

        this.handleConfirmDialogClose();
    };

    handleRefresh = () => {
        this.setState({loading: true});

        if (this.props.onRefresh) {
            this.props.onRefresh()
                .then(() => {
                    this.setState({loading: false});
                })
                .catch(error => {
                    console.error("Error refreshing viewer lists:", error);
                    this.props.enqueueSnackbar("Failed to refresh viewer lists", {variant: "error"});
                    this.setState({loading: false});
                });
        } else {
            this.setState({loading: false});
        }
    };

    render() {
        const {
            approvedViewers = [],
            pendingViewers = [],
            blockedViewers = [],
            activeViewers = []
        } = this.props;

        const {showConfirmDialog, action, loading} = this.state;

        return (
            <Box mt={2}>
                <Button
                    startIcon={loading ? <CircularProgress size={16}/> : <RefreshIcon/>}
                    variant="outlined"
                    size="small"
                    onClick={this.handleRefresh}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh Viewers"}
                </Button>

                {pendingViewers.length > 0 && (
                    <>
                        <Typography variant="h6">Pending Approval ({pendingViewers.length})</Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Viewer ID</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingViewers.map(viewer => (
                                        <TableRow key={viewer}>
                                            <TableCell component="th" scope="row">
                                                {viewer}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    aria-label="approve"
                                                    onClick={() => this.handleConfirmDialogOpen(viewer, "approve")}
                                                    disabled={loading}
                                                >
                                                    <CheckCircleIcon color="primary"/>
                                                </IconButton>
                                                <IconButton
                                                    aria-label="block"
                                                    onClick={() => this.handleConfirmDialogOpen(viewer, "block")}
                                                    disabled={loading}
                                                >
                                                    <BlockIcon color="secondary"/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {approvedViewers.length > 0 && (
                    <>
                        <Typography variant="h6" style={{marginTop: 16}}>Approved Viewers
                            ({approvedViewers.length})</Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Viewer ID</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {approvedViewers.map(viewer => {
                                        const isActive = activeViewers && activeViewers.includes(viewer);
                                        return (
                                            <TableRow key={viewer}
                                                      style={isActive ? {background: 'rgba(76, 175, 80, 0.1)'} : {}}>
                                                <TableCell component="th" scope="row">
                                                    {viewer}
                                                </TableCell>
                                                <TableCell>
                                                    {isActive ? (
                                                        <Chip size="small" label="Connected" color="primary"/>
                                                    ) : (
                                                        <Chip size="small" label="Approved"/>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        aria-label="block"
                                                        onClick={() => this.handleConfirmDialogOpen(viewer, "block")}
                                                        disabled={loading}
                                                    >
                                                        <BlockIcon/>
                                                    </IconButton>
                                                    <IconButton
                                                        aria-label="remove"
                                                        onClick={() => this.handleConfirmDialogOpen(viewer, "remove")}
                                                        disabled={loading}
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {blockedViewers.length > 0 && (
                    <>
                        <Typography variant="h6" style={{marginTop: 16}}>Blocked Viewers
                            ({blockedViewers.length})</Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Viewer ID</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {blockedViewers.map(viewer => (
                                        <TableRow key={viewer}>
                                            <TableCell component="th" scope="row">
                                                {viewer}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    aria-label="unblock"
                                                    onClick={() => this.handleConfirmDialogOpen(viewer, "unblock")}
                                                    disabled={loading}
                                                >
                                                    <CheckCircleIcon/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {approvedViewers.length === 0 && pendingViewers.length === 0 && blockedViewers.length === 0 && (
                    <Typography variant="body1">No viewers connected yet.</Typography>
                )}

                <Dialog
                    open={showConfirmDialog}
                    onClose={this.handleConfirmDialogClose}
                >
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to {action} this viewer?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleConfirmDialogClose} color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={this.handleConfirmAction}
                            color="primary"
                            autoFocus
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24}/> : "Confirm"}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }
}

ViewerManagement.propTypes = {
    roomId: PropTypes.string,
    onManageViewer: PropTypes.func.isRequired,
    onRefresh: PropTypes.func,
    approvedViewers: PropTypes.array,
    pendingViewers: PropTypes.array,
    blockedViewers: PropTypes.array,
    activeViewers: PropTypes.array,
    enqueueSnackbar: PropTypes.func.isRequired
};

export default withSnackbar(ViewerManagement);
