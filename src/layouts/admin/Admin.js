import React, { Component } from 'react'
import AppContext from '../../AppContext'
import * as firebase from 'firebase'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import NewSchool from './NewSchool'
import ListSupporters from './ListSupporters'
import Messages from './Messages'
import TextField from '@material-ui/core/TextField'
import EditSchool from './EditSchool'

function xoa_dau(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

class Admin extends Component {
    constructor(props) {
        super(props)

        this.state = {
            school: {},
            addNewSchool: false,
            search: '',
        }

        this.ref = firebase.database().ref(this.props.DB_PREFIX + '/groups').on('value', snap => {
            var schools = snap.val()
            Object.keys(schools).forEach(code => {
                this.updateSchool(code, schools[code])
            })
        })
    }

    componentWillUnmount() {
        this.ref.off()
    }

    updateSchool = (code, data) => {
        if (this.props.user.role != 1000
            && code != this.props.user.group) return
        this.setState(({ school }) => ({
            school: {
                ...school,
                [code]: data,
            }
        }))
    }

    clickSchool = (s) => () => {
        this.setState({
            selectedSchool: s,
            messages: null,
        })
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
        const { school, selectedSchool, addNewSchool, messages, editSchool } = this.state
        const { user } = this.props
        const showIfAdmin = {
            'display': user.role == 1000 ? 'inherit' : 'none'
        }

        return (
            <div className="Admin">
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" color="inherit">SCS - Admin</Typography>
                    </Toolbar>
                </AppBar>
                <div className={'container mt-3'}>

                    <Button variant="contained" color="primary" onClick={this._addNewSchool} style={showIfAdmin}>
                        Thêm trường
                    </Button>
                    <br />
                    <TextField
                        id="outlined-name"
                        label="Tìm kiếm theo tên trường"
                        margin="normal"
                        variant='outlined'
                        fullWidth
                        value={this.state.search}
                        style={showIfAdmin}
                        onChange={(e) => {
                            const { value } = e.target
                            this.setState({ search: value })
                        }}
                    />
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
                            <ListSupporters school={selectedSchool} />
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
                            <Messages school={messages} />
                        </div>
                    </div> : <div className='row'>
                                {Object.keys(school).filter(s => {
                                    const sc = school[s]
                                    return xoa_dau(sc.name.toLowerCase()).includes(xoa_dau(this.state.search.toLocaleLowerCase()))
                                }).map((s, i) => <div className='col-12 col-md-6 col-lg-6 col-xl-6' key={i}><div className={'card card-body mt-3 Card'}>
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
                                        style={showIfAdmin}
                                        onClick={this.editSchool(s, school[s])}
                                    >
                                        Sửa thông tin trường
                            </Button>
                                </div>
                                </div>)}
                            </div>}
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
