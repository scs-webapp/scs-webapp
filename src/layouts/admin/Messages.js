import React, {Component} from 'react'
import * as firebase from 'firebase'
import AppContext from '../../AppContext'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import CommentIcon from '@material-ui/icons/Comment'
import moment from 'moment'
import {Button} from '@material-ui/core'

class Messages extends Component {
    constructor(props) {
        super(props)
        const currentGroup = this.props.school
        console.log(currentGroup)
        this.convRef = firebase.database()
            .ref(this.props.DB_PREFIX + '/conversations/group/' + currentGroup)
        this.messRef = null

        this.state = {
            conversations: [],
            current: [],
            c: null,
        }

        this.convRef.on('child_added', this.updateConversation)
        this.convRef.on('child_changed', this.updateConversation)
    }

    componentWillUnmount() {
        this.convRef.off()
    }

    updateConversation = (snap) => {
        const conversation = snap.val() || {}
        conversation.$tid = snap.key

        console.log(conversation)
        if (!conversation.psid) return

        var isnew = false
        const newConversations = this.state.conversations.map(c => {
            if (c.$tid === conversation.$tid) {
                isnew = true
                return conversation
            }
            return c
        })
        this.setState(({conversations}) => ({
            conversations: !isnew ? [conversation, ...conversations] : newConversations
        }))
    }

    displayMessage = (c) => () => {
        this.setState({
            c,
        })
        this.messRef = firebase.database()
            .ref(this.props.DB_PREFIX + '/conversations/msg/' + this.props.school + '/' + c.$tid)

        this.setState({current: []})
        this.messRef.on('child_added', this.appendToMessageList)
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

    render() {
        const {c, current} = this.state

        return (
            <div className="Messages">
                <div className={'text-muted'}>Quản lý tin nhắn</div>
                {c ? <div className={'card card-body'}>
                        <div className={'d-flex justify-content-between'}>
                            <Button>
                                {c.name}
                            </Button>
                            <Button onClick={() => {
                                this.messRef.off()
                                this.setState({c: null})
                            }}>
                                Quay lại
                            </Button>
                        </div>
                        <div className={'MessagesWrapper'}>
                            {current.map((m, i) => <div key={i} className={'Message'}>
                                <div className={m.page ? 'Ours' : 'Yours'}>
                                    <div className={'Textt'}>{m.text}</div>
                                </div>
                            </div>)}
                        </div>
                    </div> :
                    <List>
                        {this.state.conversations.map((c, i) => <ListItem key={i}>
                            <ListItemText
                                primary={c.name}
                                secondary={`Tư vấn viên: ${c.answeredBy} - ${c.lastMsg ? 'Tin nhắn cuối: ' + moment(c.lastMsg.time).format('MMMM Do YYYY, h:mm:ss a') : ''} ${c.state < 2 ? ' (Đã kết thúc)' : ''}`}
                            />

                            <ListItemSecondaryAction>
                                <IconButton aria-label="Comments" onClick={this.displayMessage(c)}>
                                    <CommentIcon/>
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>)}
                    </List>
                }
            </div>
        )
    }
}

export default function (props) {
    return (
        <AppContext.Consumer>
            {(app) => <Messages
                {...{
                    ...app,
                    ...props,
                }}
            />}
        </AppContext.Consumer>
    )
}
