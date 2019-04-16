import React, {Component} from 'react'
import AppContext from './AppContext'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import * as firebase from 'firebase'
import Register from './containers/register/Register'
import Init from './containers/init/Init'
import Supporter from './layouts/supporter/Supporter'
import Admin from './layouts/admin/Admin'

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
}

const DB_PREFIX = process.env.REACT_APP_DB_PREFIX

const config = {
    apiKey: 'AIzaSyBxBvZZPxo06HQWHWudRGytuJoSNw5LNX8',
    authDomain: 'localhost',
    databaseURL: 'https://page-tuyen-sinh.firebaseio.com',
    projectId: 'page-tuyen-sinh',
    storageBucket: 'page-tuyen-sinh.appspot.com',
    messagingSenderId: '497060879105'
}

class App extends Component {
    constructor(props) {
        super(props)
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
        this.state = {
            appState: null,
            DB_PREFIX,
        }
    }

    componentWillMount() {
        this._doLogin()
    }

    _doLogin = () => {
        const urlParams = new URLSearchParams(window.location.search)
        const email = urlParams.get('email')
        const password = urlParams.get('password')

        if (!email) return this.setState({
            appState: 'new_user'
        })

        this.setState({
            appState: 'loading',
            email,
            password,
        })

        firebase.auth().signInWithEmailAndPassword(
            email, password
        ).then((data) => {
            this.setState({
                uId: data.$uid
            })
            this._getUserInfo(data.user.uid)
        }).catch((error) => {
            if (error.message === 'The password is invalid or the user does not have a password.') return alert('Sai mật khẩu')
            this._doRegister(email, password)
        })
    }

    _getUserInfo = (uid) => {
        firebase.database().ref(DB_PREFIX + '/users/' + uid).once('value')
            .then(snap => {
                firebase.database().ref(DB_PREFIX + '/groups').once('value').then(gr => {
                    var groups = gr.val()
                    console.log(groups)
                    var userData = snap.val() || {}
                    userData.$uid = uid
                    if (!userData.role) {
                        this.setState({
                            appState: 'register',
                            uid,
                            groups,
                            isLocked: userData.role === 0
                        })
                    } else {
                        const {role} = userData
                        this.setState({
                            appState: role >= 800 ? 'admin' : 'supporter',
                            user: userData,
                        })
                    }
                })
            })
            .catch(err => {
                console.log(err)
            })
    }

    _doRegister = (email, password) => {
        this.setState({
            appState: 'init',
        })

        return firebase.auth().createUserWithEmailAndPassword(
            email, password
        ).then(() => {
            this._doLogin()
        }).catch(() => {
            alert('Có lỗi xảy ra, vui lòng báo lại với admin')
        })
    }

    _register = (user) => {
        const userId = this.state.uid
        return firebase.database().ref(DB_PREFIX + '/users/' + userId).set(
            this.removeTempKeys(user)
            , (err) => {
                if (err) {
                    console.log(err)
                    alert('Có lỗi xảy ra')
                }
                this.setState({
                    isLocked: true
                })
                alert('Đăng ký thành công, hãy chờ admin duyệt tài khoản của bạn')
            });
    }

    _changeState = (changedState) => this.setState(changedState)

    decodeFirebaseArray = (arr, id_name) => {
        if (!arr || Array.isArray(arr)) return arr;
        return Object.keys(arr).map(function (key) {
            arr[key]['$' + id_name] = key;
            return arr[key];
        });
    }

    removeTempKeys = (obj) => {
        var nObj = Object.assign({}, obj);
        Object.keys(nObj).forEach(function (key) {
            if (key.startsWith('$')) delete nObj[key];
        });
        return nObj;
    }

    renderApp = () => {
        const {appState} = this.state
        const combinedProps = {
            ...this.props,
            ...this.state,
        }
        if (appState === 'loading') return <p>
            <center><br/><br/><img src="https://raw.githubusercontent.com/manh16nd/chon-truong/master/loading.gif"
                                   alt="Loading"/></center>
        </p>
        if (appState === 'init') return <Init/>
        if (appState === 'register') return <Register {...combinedProps}/>
        if (appState === 'supporter') return <Supporter {...combinedProps}/>
        if (appState === 'admin') return <Admin {...combinedProps}/>
        return null
    }

    render() {

        return (
            <AppContext.Provider
                value={{
                    app: this.state,
                    changeState: this._changeState,
                    register: this._register,
                    removeTempKeys: this.removeTempKeys,
                    decodeFirebaseArray: this.decodeFirebaseArray,
                    DB_PREFIX,
                }}
            >
                {this.renderApp()}
            </AppContext.Provider>
        )
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(App)
