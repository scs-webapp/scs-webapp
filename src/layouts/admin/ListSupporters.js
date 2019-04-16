import React, {Component} from 'react'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FolderIcon from '@material-ui/icons/AccountCircle'
import DeleteIcon from '@material-ui/icons/Create'
import * as firebase from 'firebase'
import AppContext from '../../AppContext'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'

class ListSupporters extends Component {
    constructor(props) {
        super(props)
        this.state = {
            users: []
        }
        this.ref = firebase.database().ref(this.props.DB_PREFIX + '/users')
            .orderByChild('group')
            .equalTo(this.props.school)
        this.ref.on('value', snap => this.updateUsers(snap))
    }

    componentWillUnmount() {
        this.ref.off()
    }

    updateUsers = (snap) => {
        this.setState({
            users: this.props.decodeFirebaseArray(snap.val() || {}, 'uid')
        })
    }

    editUser = (user) => () => {
        this.setState({
            editUser: user ? {...user} : null,
        })
    }

    changeInput = (key) => (e) => {
        const {value} = e.target

        this.setState(({editUser}) => ({
            editUser: {
                ...editUser,
                [key]: value,
            }
        }))
    }

    changeRadio = (key) => (e) => {
        const {value} = e.target

        this.setState(({editUser}) => ({
            editUser: {
                ...editUser,
                [key]: Number(value),
            }
        }))
    }

    handleSave = () => {
        const {editUser} = this.state
        firebase.database().ref(this.props.DB_PREFIX + '/users/' + editUser.$uid).set(
            this.props.removeTempKeys(editUser)
            , (err) => {
                if (!err) {
                    console.log(123)
                    return this.editUser()()
                }
                alert(err)
            })
    }

    changeSwitch = (e) => {
        const value = e.target.checked ? 500 : 0
        this.setState(({editUser}) => ({
            editUser: {
                ...editUser,
                role: value,
            }
        }))
    }

    render() {
        const {users, editUser} = this.state

        return (
            <div className="ListSupporters">
                <List dense={false}>
                    {(!users || !users.length) &&
                    <div className="d-flex justify-content-center">
                        <div className={'text-muted'}>Không có tư vấn viên nào thuộc trường này</div>
                    </div>}
                    {users.map((user, i) => <ListItem key={i}>
                        <ListItemIcon>
                            <FolderIcon/>
                        </ListItemIcon>
                        <ListItemText
                            primary={user.role ? user.name :
                                <span>{user.name} - <span className={'text-muted'}>Chưa kích hoạt</span></span>}
                        />
                        <ListItemSecondaryAction>
                            <IconButton aria-label="Delete" onClick={this.editUser(user)}>
                                <DeleteIcon/>
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>)}
                </List>
                <Dialog
                    open={editUser}
                    onClose={this.editUser(null)}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Sửa thông tin tư vấn viên</DialogTitle>
                    <DialogContent>
                        <RadioGroup
                            aria-label={'role'}
                            onChange={this.changeRadio('role')}
                            value={editUser ? editUser.role : null}
                        >
                            <FormControlLabel value={500} control={<Radio/>} label="Tư vấn viên"/>
                            <FormControlLabel value={800} control={<Radio/>} label="Biên tập viên"/>
                            <FormControlLabel value={0} control={<Radio/>} label="Hủy kích hoạt"/>
                        </RadioGroup>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="email"
                            onChange={this.changeInput('email')}
                            label="Email"
                            value={editUser ? editUser.email : ''}
                            type={'email'}
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            onChange={this.changeInput('name')}
                            label="Tên đầy đủ"
                            value={editUser ? editUser.name : ''}
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="desc"
                            onChange={this.changeInput('desc')}
                            label="Tự giới thiệu"
                            value={editUser ? editUser.desc : ''}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.editUser(null)} color="primary">
                            Hủy
                        </Button>
                        <Button variant="contained" onClick={this.handleSave} color="primary">
                            Sửa thông tin
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default function (props) {
    return (
        <AppContext.Consumer>
            {(app) => <ListSupporters
                {...{
                    ...app,
                    ...props,
                }}
            />}
        </AppContext.Consumer>
    )
}
