import React, {Component} from 'react'
import * as firebase from 'firebase'
import AppContext from '../../AppContext'

class NewUser extends Component {
    state = {form: {role: 500}, loading: false,}

    _onChangeInput = (key) => (e) => {
        const {value} = e.target
        this.setState(({form}) => ({
            form: {
                ...form,
                [key]: value
            }
        }))
    }

    _onSubmit = (e) => {
        e.preventDefault()
        this.setState({
            loading: true,
        })

        const {email, password, repassword} = this.state.form
        if (password !== repassword) return alert('Nhập lại mật khẩu')

        firebase.auth().createUserWithEmailAndPassword(
            email, password
        )
            .then(() => {
                return firebase.auth().signInWithEmailAndPassword(email, password)
                    .then(data => {
                        const uId = data.$uid
                        const {password, repassword, ...restUser} = this.state.form
                        return firebase.database().ref(this.props.DB_PREFIX + '/users/' + uId).set(
                            this.props.removeTempKeys(restUser)
                            , (err) => {
                                if (err) {
                                    console.log(err)
                                    alert('Có lỗi xảy ra')
                                }
                                alert('Đăng ký thành công, hãy chờ admin duyệt tài khoản của bạn')
                            })
                    })
                    .catch(e => {
                        console.log(e)
                    })
            })
            .catch(e => {
                const {code} = e
                if (code === 'auth/email-already-in-use') return alert('Email này đã được sử dụng')
                alert('Có lỗi xảy ra, vui lòng báo lại với admin')
            })
    }

    render() {
        const {form, loading} = this.state

        return (
            <div className="NewUser mt-5">
                <div className="container">
                    <div className="card card-body Card">
                        <p className={'text-muted'}>Đăng ký tài khoản</p>
                        <form onSubmit={this._onSubmit}><label htmlFor={'email'}>Email</label>
                            <input
                                className={'form-control'}
                                id={'email'}
                                value={form.email}
                                autoComplete={'false'}
                                onChange={this._onChangeInput('email')}
                            />
                            <label htmlFor={'password'}>Mật khẩu</label>
                            <input
                                className={'form-control'}
                                id={'password'}
                                value={form.password}
                                autoComplete={'false'}
                                onChange={this._onChangeInput('password')}
                                type={'password'}
                            />
                            <label htmlFor={'repassword'}>Nhập lại mật khẩu</label>
                            <input
                                className={'form-control'}
                                id={'repassword'}
                                value={form.repassword}
                                autoComplete={'false'}
                                onChange={this._onChangeInput('repassword')}
                                type={'password'}
                            />
                            <label htmlFor={'name'}>Tên đầy đủ</label>
                            <input
                                className={'form-control'}
                                value={form.name}
                                id={'name'}
                                autoComplete={'off'}
                                onChange={this._onChangeInput('name')}
                            />
                            <label htmlFor={'group'}>Mã trường</label>
                            <input
                                className={'form-control'}
                                value={form.group}
                                id={'group'}
                                onChange={this._onChangeInput('group')}
                                autoComplete={'off'}
                            />
                            <label htmlFor={'desc'}>Lời chào</label>
                            <input
                                className={'form-control'}
                                value={form.desc}
                                id={'desc'}
                                autoComplete={'off'}
                                onChange={this._onChangeInput('desc')}
                            />
                            <button className={'btn btn-primary mt-3'} type={'submit'} disabled={loading}>Đăng ký tài
                                khoản
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

export default function (props) {
    return (
        <AppContext.Consumer>
            {(app) => <NewUser
                {...{
                    ...app,
                    ...props,
                }}
            />}
        </AppContext.Consumer>
    )
}
