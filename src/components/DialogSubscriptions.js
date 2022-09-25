import React, {useEffect} from 'react';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import API from "../Util/API";


function SimpleDialog(props) {

  const { onClose, open, subscriptions, setSubscriptions } = props;

  const handleDeny = (subId, i) => {

  }

  const handleApprove = (subId, i) => {

  }


  return (
    <Dialog onClose={() => onClose()} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Applicant List</DialogTitle>
      <List>
        {
            subscriptions && subscriptions.map((sub, i) => {

                const {subscriber} = sub

                return (
                <ListItem key={sub.id}>
                    <div style={{display:"flex", flexDirection:"column", alignItems:"center", border:"2px solid black", borderRadius:"10px", padding:"10px"}}>
                        <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>

                            <ListItemAvatar>
                            {
                            subscriber.picture
                            ? <Avatar alt={subscriber.displayName} src={subscriber.picture} />
                            :
                            <Avatar alt={subscriber.displayName} >{subscriber.icon || <PersonIcon />}</Avatar>
                            }
                            </ListItemAvatar>
                        <ListItemText primary={subscriber.displayName} />
                        </div>

                        <div style={{display:"flex", justifyContent:"center", marginTop:"5px"}}>
                            <Button variant={'contained'} color={'primary'} onClick={() => handleApprove(sub.id, i) }>Approve</Button>
                            <Button variant={'contained'} color={'primary'} onClick={() => handleDeny(sub.id, i) }>Deny</Button>
                        </div>

                    </div>
                </ListItem>
                )

            })
        }

      </List>
    </Dialog>
  );
}



export default function DialogSubscription({rallyId}) {
  const [open, setOpen] = React.useState(false);
  const [subscriptions, setSubscriptions] = React.useState([]);

  const getSubscriptions = async (rallyId) => {



  }


  useEffect(()=> {


    getSubscriptions(rallyId).then(setSubscriptions)


  }, [rallyId])


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if(subscriptions.length === 0) return null

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Show Applicants
      </Button>
      <SimpleDialog open={open} subscriptions={subscriptions} onClose={handleClose} setSubscriptions={setSubscriptions} />
    </>
  );
}
