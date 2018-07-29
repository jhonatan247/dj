import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import DatePicker from 'material-ui-pickers/DatePicker';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import locationsData from '../assets/data/locations.json'
import wasteTypesData from '../assets/data/waste-types.json'

import Loader from './Loader';

const styles = theme => ({
  form: {
    margin: 20,
    padding: 20,
    minHeight: 'calc(100vh - 80px)'
  },
  button: {
    marginTop: 30
  },
  formControl: {
    marginTop: 20
  },
})

class RequestPickupForm extends Component {
  state = {
    locations: [],
    wasteTypes: [],
    ...this.initialState()
  };

  componentDidMount() {
    // fetch('https://api.mydomain.com')
    //   .then(response => response.json())
    //   .then(data => this.setState({
    //     data
    //   }));

    this.setState({
      wasteTypes: wasteTypesData.types,
      locations: locationsData.locations,
      error: {}
    });
  }

  initialState() {
    return {
      selectedWasteType: '',
      selectedLocation: '',
      selectedDate: null,
      isLoading: false,
      error: {},
      open: false
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleDateChange = date => {
    this.setState({
      selectedDate: date
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = event => {
    event.preventDefault();

    const error = {};
    let hasErrors = false;

    if (!this.state.selectedWasteType) {
      error.selectedWasteType = true;
      hasErrors = true;
    }

    if (!this.state.selectedLocation) {
      error.selectedLocation = true;
      hasErrors = true;
    }

    if (!this.state.selectedDate) {
      error.selectedDate = true;
      hasErrors = true;
    }

    this.setState({
      isLoading: !hasErrors,
      error
    });

    if (!hasErrors) {
      setTimeout(() => {
        this.setState({
            ...this.initialState(),
            open: true
          }
        );
      }, 1000);
    }
  };

  render() {
    const { classes } = this.props;
    return (
      <Grid container spacing={24} justify="center">>
       <Grid item xs={10}>
          <Paper>
            <form autoComplete="off" className={classes.form} onSubmit={this.handleSubmit} >
              <Typography variant="title" className={classes.typography} gutterBottom>
                Solicitud para recolección de residuos
              </Typography>
              <FormControl error={this.state.error.selectedWasteType} required className={classes.formControl} fullWidth={true}>
                <InputLabel htmlFor="waste-type">Tipo de residuo</InputLabel>
                <Select
                  value={this.state.selectedWasteType}
                  onChange={this.handleChange}
                  inputProps={{
                    name: 'selectedWasteType',
                    id: 'waste-type'
                  }}
                >
                  {
                    this.state.wasteTypes.map((wasteType) =>
                      <MenuItem key={wasteType.replace(/[^a-z0-9áéíóúñü_-\s,]/gim, '')} value={wasteType}>{wasteType}</MenuItem>
                    )
                  }
                </Select>
                <FormHelperText>Obligatorio</FormHelperText>
              </FormControl>
              <FormControl error={this.state.error.selectedLocation} required className={classes.formControl} fullWidth={true}>
                <InputLabel htmlFor="location">Localidad</InputLabel>
                <Select
                  value={this.state.selectedLocation}
                  onChange={this.handleChange}
                  inputProps={{
                    name: 'selectedLocation',
                    id: 'location'
                  }}
                >
                  {
                    this.state.locations.map((location, index) =>
                      <MenuItem key={location.replace(/[^a-z0-9áéíóúñü_-\s,]/gim, '')} value={index}>{location}</MenuItem>
                    )
                  }
                </Select>
                <FormHelperText>Obligatorio</FormHelperText>
              </FormControl>
              <FormControl error={this.state.error.selectedDate} className={classes.formControl} required fullWidth={true}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <DatePicker
                    autoOk
                    label="Seleccionar fecha *"
                    value={this.state.selectedDate}
                    onChange={this.handleDateChange}
                    disablePast={true}
                  />
                </MuiPickersUtilsProvider>
                <FormHelperText>Obligatorio</FormHelperText>
              </FormControl>
              <FormControl className={classes.formControl} fullWidth={false}>
                <Button variant="contained" color="primary" className={classes.button} type="submit">
                  Solicitar recolección
                </Button>
              </FormControl>
            </form>
          </Paper>
        </Grid>
        <Dialog
          fullScreen={false}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">{"Se ha enviado la solicitud correctamente"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Se ha registrado la solicitud
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Ok
            </Button>
          </DialogActions>
        </Dialog>
        {
          this.state.isLoading ? < Loader / > : ''
        }
      </Grid>
    );
  }
}

RequestPickupForm.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RequestPickupForm);
