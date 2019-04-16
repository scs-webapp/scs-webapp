import React, {Component} from 'react'
import AppContext from '../../AppContext'

class Register extends Component {
    constructor(props) {
        super(props)

        this.state = {
            form: {
                email: this.props.email || '',
                name: '',
                group: '',
                desc: '',
                role: 0,
            }
        }
    }

    _onChangeInput = (key) => (e) => {
        const {value} = e.target

        this.setState(({form}) => ({
            form: {
                ...form,
                [key]: value
            }
        }))
    }

    _onSubmit = async  () => {
        const {form} = this.state
        if (form.email && form.name && form.group && form.name.length > 10) {
            this.setState({
                loading: true,
            })
            await this.props.register(form)
            this.setState({
                loading: false,
            })
        } else {
            alert('Vui lòng điền đầy đủ thông tin')
        }
    }

    render() {
        const {form, loading} = this.state
        var blockMsg = {
			display: this.props.isLocked ? "flex" : "none"
		}
		
		var regForm = {
			display: this.props.isLocked ? "none" : "flex"
		}

        return (
            <div className="Register">
                <div className="container">
                    <div className="card card-body Card" style={blockMsg}>
                        Tài khoản của bạn chưa được kích hoạt.<br/>Bạn hãy đợi thêm hoặc thông báo với admin nhé!
                    </div>
                    <div className="card card-body Card" style={regForm}>
                        <small className={'text-muted'}>Trước tiên, bạn phải đăng ký thông tin tài khoản trước</small><br/>
                        <label htmlFor={'email'}>Email</label>
                        <input
                            className={'form-control'}
                            id={'email'}
                            value={form.email}
                            onChange={this._onChangeInput('email')}
                            disabled
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
                        <select
                            className="custom-select"
                            value={form.group}
                            id={'group'}
                            onChange={this._onChangeInput('group')}
                        >
                            <option>Chọn một trường</option>
                            {this.props.groups && Object.keys(this.props.groups).map((g, i) => <option
                                key={i}
                                value={g}
                            >
                                {this.props.groups[g].name}
                            </option>)}
                        </select>
                        {/*<input*/}
                            {/*className={'form-control'}*/}
                            {/*value={form.group}*/}
                            {/*id={'group'}*/}
                            {/*onChange={this._onChangeInput('group')}*/}
                            {/*autoComplete={'off'}*/}
                        {/*/>*/}
                        <label htmlFor={'desc'}>Lời chào (là tin nhắn sẽ gửi để giới thiệu bản thân khi bạn bắt đầu trả lời tin nhắn)</label>
                        <input
                            className={'form-control'}
                            value={form.desc}
                            placeholder="VD: Xin chào em, anh/chị tên là ABC, học ở lớp DEF trường XYZ"
                            id={'desc'}
                            autoComplete={'off'}
                            onChange={this._onChangeInput('desc')}
                        />
                        <button className={'btn btn-primary mt-3'} onClick={this._onSubmit} disabled={loading}>Đăng ký</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default function (props) {
    return (
        <AppContext.Consumer>
            {(app) => <Register
                {...{
                    ...app,
                    ...props,
                }}
            />}
        </AppContext.Consumer>
    )
}
