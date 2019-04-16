import React, {Component} from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import AppContext from '../../AppContext'
import * as firebase from 'firebase'
import axios from 'axios'
import {animateScroll} from 'react-scroll'
import ButtonDropdown from 'reactstrap/es/ButtonDropdown'
import DropdownToggle from 'reactstrap/es/DropdownToggle'
import DropdownMenu from 'reactstrap/es/DropdownMenu'
import DropdownItem from 'reactstrap/es/DropdownItem'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'

const server = process.env.REACT_APP_SERVER

class Supporter extends Component {
    constructor(props) {
        super(props)
        const currentGroup = this.props.user.group

        this.convRef = firebase.database()
            .ref(this.props.DB_PREFIX + '/conversations/group/' + currentGroup)
            .orderByChild('status')
            .startAt(2)
            .endAt(3)
        this.messRef = null

        this.convRef.on('child_added', this.updateConversation)
        this.convRef.on('child_changed', this.updateConversation)
        this.messagesEnd = React.createRef()

        this.state = {
            conversations: [],
            open: null,
            current: [],
            text: '',
            dropdown: false,
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.current.length !== this.state.current.length) {
            animateScroll.scrollToBottom({
                containerId: 'MESSAGES'
            })
        }
    }

    appendToMessageList = (snap) => {
        const msg = snap.val()
        this.setState(({current}) => ({
            current: [
                ...current,
                msg,
            ]
        }))
    }

    updateConversation = (snap) => {
        const userData = this.props.user
        const conversation = snap.val() || {}
        conversation.$tid = snap.key

        if (conversation.status !== 2 && conversation.status !== 3) return
        if (conversation.group !== userData.group) return

        // delete old conversation
        const newConversations = this.state.conversations.filter(c => {
            return c.$tid !== conversation.$tid
        })
        // add new conversation to top
        newConversations.unshift(conversation)
        // sort by time
        newConversations.sort((a, b) => {
            if (!a.lastMsg || !b.lastMsg) return 0
            if (a.lastMsg.time > b.lastMsg.time) {
                return -1
            } else if (a.lastMsg.time < b.lastMsg.time) {
                return 1
            }
            return 0
        })

        this.setState(({conversations}) => ({
            conversations: newConversations
        }))
    }

    onClickConversation = (c) => () => {
        if (this.state.open && this.state.open.$tid === c.$tid) {
            this.setState({
                open: null,
                current: [],
                text: '',
            })
            if (this.messRef) this.messRef.off('child_added', this.appendToMessageList)
            return
        }

        this.setState({
            open: c,
            current: [],
            text: '',
        })

        this.messRef = firebase.database()
            .ref(this.props.DB_PREFIX + '/conversations/msg/' + this.props.user.group + '/' + c.$tid)
            .orderByKey()
            .limitToLast(20)

        this.messRef.on('child_added', this.appendToMessageList)
    }

    _onSubmit = (c) => (e) => {
        e.preventDefault()
        if (this.state.text) return firebase.auth().currentUser.getIdToken(true).then((idToken) => {
            const {text} = this.state
            axios.post(`https://${server}/pagetuyensinh/staffSendMessage`, {
                idToken,
                tid: c.$tid,
                text
            })
                .then(resp => {
                    const {data} = resp
                    if (data.error) return alert(data.error)
                    this.setState({
                        text: '',
                    })
                })
                .catch(err => alert(err.message || err))
        })
            .catch(e => alert(e.message || e))
    }

    toggle = () => {
        this.setState({
            dropdown: !this.state.dropdown
        })
    }

    out = () => {
        if (!window.confirm('Bạn có chắc chắn muốn kết thúc cuộc trò chuyện này?')) return
        firebase.auth().currentUser.getIdToken(true).then((idToken) => {
            return axios.post(`https://${server}/pagetuyensinh/staffResetStatus`, {
                idToken,
                'tid': this.state.open.$tid,
            })
                .then(ok => {
                    window.location.reload()
                })
                .catch(err => alert(err))
        })
    }

    greet = () => {
        return firebase.auth().currentUser.getIdToken(true).then((idToken) => {
            const c = this.state.open
            console.log('123')

            axios.post(`${process.env.REACT_APP_SERVER}/pagetuyensinh/staffSendMessage`, {
                idToken,
                tid: c.$tid,
                text: this.props.user.desc,
            })
                .then(resp => {
                    const {data} = resp
                    if (data.error) return alert(data.error)
                })
                .catch(err => alert(err.message || err))
        })
            .catch(e => alert(e.message || e))
    }

    renderConversation = () => {
        const {current, open, dropdown} = this.state

        return <div className={'card mt-3 mb-3'}>
            <div className={'card-header Title'} onClick={this.onClickConversation(open)}><b>↩ Quay lại </b> | {this.state.open.name}</div>
            <div className=" card-body Card" id={'MESSAGES'}>
                {current.map((m, i) => <div key={i} className={'Message'}>
                    <div className={m.page ? 'Ours' : 'Yours'}>
                        <div className={'Textt'}>{m.text}</div>
                    </div>
                </div>)}
            </div>
            <div className={'Text'}>
                <form className={'FormMessage'} onSubmit={this._onSubmit(open)}>
                    <div style={{
                        width: '10%'
                    }}>
                        < ButtonDropdown isOpen={dropdown} toggle={this.toggle} style={{width: '10%'}}>
                            <DropdownToggle color={'primary'}><i className='fas fa-bars'></i>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={this.greet}>
                                    Gửi lời chào hỏi
                                </DropdownItem>
                                <DropdownItem onClick={this.out}>
                                    Kết thúc chat
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </div>
                    <input className={'form-control'} placeholder={'Gửi tin nhắn'} value={this.state.text}
                           onChange={e => this.setState({text: e.target.value})}/>
                    <div className={'SendIcon'}>
                        <button type={'submit'} style={{color: '#fff'}}>
                            <Icon>send
                            </Icon>
                        </button>
                    </div>
                </form>
            </div>
        </div>
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

    handleSaveUser = () => {
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

    render
    () {
        const {user} = this.props
        const {conversations, open, editUser} = this.state
        const bgRead = { 'background-color': '#fff' }
        const bgUnread = { 'background-color': '#eee' }

        return (
            <div className={'Supporter'}>
                <AppBar position="static" style={{background: '#3E8C33'}}>
                    <Toolbar>
                        <Typography variant="h6" color="inherit">Welcome to SCS</Typography>
                    </Toolbar>
                </AppBar>
                <div className={'container mt-3'}>
                    <span className="text-muted">Xin chào,</span>
                    <span className={'font-weight-bold'}> {user.name}</span>
                    <Button onClick={this.editUser(user)} color="primary">Sửa lời chào</Button>

                    {open ? this.renderConversation() :
                        conversations.map((c, i) => <div className={'card card-body mt-3 Card'} key={i} onClick={this.onClickConversation(c)} style={c.status !== 3 ? bgRead : bgUnread}>
                            { c.status !== 3
                                ? <div className={'Title'}><b>{c.name}</b></div>
                                : <div className={'Title'}>{c.name}</div>
                            }
                            <div
                                className={'text-muted Conversation'}>{c.lastMsg.text.substring(0,100)}{c.lastMsg.text.length < 100 ? '' : '...'}</div>
                        </div>)}
                </div>

                <Dialog
                    open={editUser}
                    onClose={this.editUser(null)}
                    aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Sửa lời chào</DialogTitle>
                    <DialogContent>
                        <p>Tự giới thiệu (là tin nhắn sẽ gửi để giới thiệu bản thân khi bạn bắt đầu trả lời tin nhắn)</p>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="desc"
                            onChange={this.changeInput('desc')}
                            placeholder="VD: Xin chào em, anh/chị tên là ABC, học ở lớp DEF trường XYZ"
                            value={editUser ? editUser.desc : ''}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.editUser(null)} color="primary">
                            Hủy
                        </Button>
                        <Button variant="contained" onClick={this.handleSaveUser} color="primary">
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
            {(app) => <Supporter
                {...{
                    ...app,
                    ...props,
                }}
            />}
        </AppContext.Consumer>
    )
}
