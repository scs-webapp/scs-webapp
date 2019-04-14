import React, {Component} from 'react'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import * as firebase from 'firebase'

class EditSchool extends Component {
    state = {
        form: {
            name: '',
            key: '',
            khoi: {
                'tự_nhiên': false,
                'xã_hội': false,
                'lực_lượng_vũ_trang': false,
                'cao_đẳng_nghề': false,
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.open) {
            if (!prevProps.open || prevProps.open.key !== this.props.open.key) {
                this.setState({
                    form: {
                        ...this.state.form,
                        ...this.props.open.school,
                        key: this.props.open.key,
                    }
                })
            }
        }
    }

    handleClose = () => {
        this.props.toggle()
    }

    handleSave = () => {
        const {form} = this.state
        const {school} = this.props

        firebase.database().ref(this.props.DB_PREFIX + '/groups').set({
            ...school,
            [form.key]: {
                name: form.name,
                khoi: form.khoi,
            }
        }).then(() => {
            this.setState({
                form: {
                    name: '',
                    key: '',
                    khoi: {
                        'tự_nhiên': false,
                        'xã_hội': false,
                        'lực_lượng_vũ_trang': false,
                        'cao_đẳng_nghề': false,
                    }
                }
            })
            this.props.toggle()
        })
    }

    changeInput = (key) => (e) => {
        const {value} = e.target
        this.setState(({form}) => ({
            form: {
                ...form,
                [key]: value,
            }
        }))
    }

    changeCheckbox = (key) => (e) => {
        const {checked} = e.target
        this.setState(({form}) => ({
            form: {
                ...form,
                khoi: {
                    ...form.khoi,
                    [key]: checked
                }
            }
        }))
    }

    render() {
        const {open, toggle} = this.props
        const {form} = this.state
        const {khoi} = form

        return (
            <div className="NewSchool">
                <Dialog
                    open={open}
                    onClose={toggle}
                    aria-labelledby="form-dialog-title"
                    maxWidth={'lg'}
                >
                    <DialogTitle id="form-dialog-title">Thêm trường mới</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="key"
                            onChange={this.changeInput('key')}
                            label="Mã trường"
                            value={form.key}
                            fullWidth
                            disabled
                        />
                        <TextField
                            margin="dense"
                            id="name"
                            onChange={this.changeInput('name')}
                            value={form.name}
                            label="Tên trường"
                            fullWidth
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={khoi['tự_nhiên']}
                                    onChange={this.changeCheckbox('tự_nhiên')}
                                    color="primary"
                                />
                            }
                            label="Khối tự nhiên"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={khoi['xã_hội']}
                                    onChange={this.changeCheckbox('xã_hội')}
                                    color="primary"
                                />
                            }
                            label="Khối xã hội"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={khoi['lực_lượng_vũ_trang']}
                                    onChange={this.changeCheckbox('lực_lượng_vũ_trang')}
                                    color="primary"
                                />
                            }
                            label="Khối lực lượng vũ trang"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={khoi['cao_đẳng_nghề']}
                                    onChange={this.changeCheckbox('cao_đẳng_nghề')}
                                    color="primary"
                                />
                            }
                            label="Các trường cao đẳng nghề"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Hủy
                        </Button>
                        <Button variant="contained" onClick={this.handleSave} color="primary">
                            Sửa thông tin trường
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default EditSchool
