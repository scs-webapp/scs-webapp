import React, {Component} from 'react'
import AppContext from '../../AppContext'
import * as firebase from 'firebase'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import NewSchool from './NewSchool'
import ListSupporters from './ListSupporters'
import Messages from './Messages'
import EditSchool from './EditSchool'

class Admin extends Component {
    constructor(props) {
        super(props)

        this.schoolRef = firebase.database().ref(this.props.DB_PREFIX + '/groups')
        this.schoolRef.on('child_added', this.updateSchool)
        this.schoolRef.on('child_changed', this.updateSchool)
        this.state = {
            school: {},
            addNewSchool: false
        }
    }

    updateSchool = (snap) => {
        this.setState(({school}) => ({
            school: {
                ...school,
                [snap.key]: snap.val(),
            }
        }))
    }

    clickSchool = (s) => () => {
        this.setState({
            selectedSchool: s,
            messages: null,
        })
        //
        // firebase.database().ref(this.props.DB_PREFIX- + '/users')
        //     .orderByChild('group')
        //     .equalTo(s)
        //     .once('value').then(snap => {
        //     var users = this.props.decodeFirebaseArray(snap.val() || {}, 'uid')
        // })
    }

    clickAllMessages = (s) => () => {
        this.setState({
            selectedSchool: null,
            messages: s,
        })
    }

    _addNewSchool = () => {
        this.setState({
            addNewSchool: !this.state.addNewSchool,
        })
    }

    editSchool = (key, school) => () => {
        if (!key || !school) return this.setState({
            editSchool: null
        })
        this.setState({
            editSchool: {
                key, school
            }
        })
    }

    render() {
        const {school, selectedSchool, addNewSchool, messages, editSchool} = this.state

        return (
            <div className="Admin">
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" color="inherit">SCS - Admin</Typography>
                    </Toolbar>
                </AppBar>
                <div className={'container mt-3'}>
                    <Button variant="contained" color="primary" onClick={this._addNewSchool}>
                        Thêm trường
                    </Button>
                    <NewSchool
                        open={addNewSchool}
                        toggle={this._addNewSchool}
                        school={school}
                        {...this.props}
                    />
                    <EditSchool
                        open={editSchool}
                        toggle={this.editSchool()}
                        school={school}
                        {...this.props}
                    />
                    {selectedSchool ? <div className={'card mt-3'}>
                        <div className={'card-header'}>

                            <div className="d-flex justify-content-between">
                                <Button>
                                    {school[selectedSchool].name}
                                </Button>
                                <Button onClick={() => this.setState({
                                    selectedSchool: null,
                                })}>
                                    Quay lại
                                </Button>
                            </div>
                        </div>
                        <div className={'card-body'}>
                            <div className="text-muted">Quản lý danh sách tư vấn viên</div>
                            <ListSupporters school={selectedSchool}/>
                        </div>
                    </div> : messages ? <div className={'card mt-3'}>
                            <div className={'card-header'}>

                                <div className="d-flex justify-content-between">
                                    <Button>
                                        {school[messages].name}
                                    </Button>
                                    <Button onClick={() => this.setState({
                                        messages: null,
                                    })}>
                                        Quay lại
                                    </Button>

                                </div>
                            </div>
                            <div className={'card-body'}>
                                <Messages school={messages}/>
                            </div>
                        </div> :
                        Object.keys(school).map((s, i) => <div className={'card card-body mt-3 Card'} key={i}>
                            <span
                                onClick={this.clickSchool(s)}
                                className={'Cursor'}
                            >
                                {school[s].name}
                            </span>
                            <Button
                                onClick={this.clickAllMessages(s)}
                            >
                                Xem tin nhắn
                            </Button>
                            <Button
                                onClick={this.clickSchool(s)}
                            >
                                Quản lý tư vấn viên
                            </Button>
                            <Button
                                onClick={this.editSchool(s, school[s])}
                            >
                                Sửa thông tin trường
                            </Button>
                        </div>)}
                </div>
            </div>
        )
    }
}

export default function (props) {
    return (
        <AppContext.Consumer>
            {(app) => <Admin
                {...{
                    ...app,
                    ...props,
                }}
            />}
        </AppContext.Consumer>
    )
}
