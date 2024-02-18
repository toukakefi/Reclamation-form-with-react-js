import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Container,
  Box,
  Grid,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)`
  margin-bottom: 20px;
  & .MuiOutlinedInput-root {
    &.Mui-focused fieldset {
      border-color: #e0f2f1; /* Couleur de contour pour le focus */
    }
    &:hover fieldset {
      border-color:teal; /* Couleur de contour pour le survol */
    }
  }
`;
const StyledButton = styled(Button)`
  margin-top: 20px;
  background-color: teal;
  color: #ffffff;
  &:hover {
    background-color: #008080;
  }
`;
const ClaimForm = () => {
  const [colisDetails, setColisDetails] = useState({});
  const [colisBarcode, setColisBarcode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [claimObject, setClaimObject] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimReason, setClaimReason] = useState('colis_endommage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success'); // Default to success

  const validatePhoneNumber = (value) => {
    return /^\d{8}$/.test(value);
  };

  const validateColisBarcode = (value) => {
    return /^\d{12}$/.test(value);
  };

  const fetchColisDetails = async () => {
    try {
      if (!validatePhoneNumber(phoneNumber) || !validateColisBarcode(colisBarcode)) {
        setAlertMessage('Le numéro de colis doit contenir 12 chiffres exactement et le numéro de téléphone doit contenir 8 chiffres exactement. Veuillez vérifier les valeurs.');
        setAlertSeverity('error');
        return;
      }

      const response = await axios.get(
        `http://fparcel.net:59/WebServiceExterne/tracking_position_STG?POSBARCODE=${colisBarcode}&POSPORTABLE=${phoneNumber}`
      );

      if (response.data === 'inexistant') {
        setColisDetails({});
        setAlertMessage('Le numéro de colis ou le numéro de téléphone est invalide. Veuillez vérifier les valeurs.');
        setAlertSeverity('error');
      } else {
        const sortedEvenements = response.data.evenements.sort((a, b) =>
          a.date.localeCompare(b.date)
        );
        setColisDetails({ ...response.data, evenements: sortedEvenements });
        setAlertMessage('Réclamation envoyée avec succès.');
        setAlertSeverity('success');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du colis :', error);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!validatePhoneNumber(phoneNumber) || !validateColisBarcode(colisBarcode)) {
        setAlertMessage('Le numéro de colis doit contenir 12 chiffres exactement et le numéro de téléphone doit contenir 8 chiffres exactement. Veuillez vérifier les valeurs.');
        setAlertSeverity('error');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.get(
        `http://fparcel.net:59/WebServiceExterne/tracking_position_STG?POSBARCODE=${colisBarcode}&POSPORTABLE=${phoneNumber}`
      );

      if (response.data === 'inexistant') {
        setAlertMessage('Le numéro de colis ou le numéro de téléphone est invalide. Veuillez vérifier les valeurs.');
        setAlertSeverity('error');
        setIsSubmitting(false);
        return;
      }

      const claimData = {
        POSBARCODE: colisBarcode,
        POSPORTABLE: phoneNumber,
        REC_OBJET: claimObject,
        REC_DESC: claimDescription,
        REC_MOTIF: claimReason,
      };

      await axios.post('http://fparcel.net:59/WebServiceExterne/add_reclamation_STG', claimData);

      setAlertMessage('Réclamation envoyée avec succès.');
      setAlertSeverity('success');
      resetFormFields();
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
      setAlertMessage("Une erreur s'est produite lors de l'envoi de la réclamation. Veuillez réessayer plus tard.");
      setAlertSeverity('error');
      setIsSubmitting(false);
    }
  };

  const resetFormFields = () => {
    setColisBarcode('');
    setPhoneNumber('');
    setClaimObject('');
    setClaimDescription('');
    setClaimReason('colis_endommage');
  };

  const handleCloseAlert = () => {
    setAlertMessage('');
  };

  return (
    <div className="claim-form-container">
      <AppBar position="static" color="primary" sx={{ backgroundColor: '#e74c3c' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Service de Livraison
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Box mt={5} p={3} boxShadow={3} bgcolor="white" borderRadius={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" align="center" gutterBottom>
                Créer une Réclamation
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <form onSubmit={handleFormSubmit}>
                <StyledTextField
                  label="Numéro de Colis (Code à barres)"
                  fullWidth
                  value={colisBarcode}
                  onChange={(e) => {
                    if (/^\d{0,12}$/.test(e.target.value)) {
                      setColisBarcode(e.target.value);
                    }
                  }}
                  required
                  variant="outlined"
                  margin="normal"
                  placeholder="Ex: 123456789012"
                  color="success"
                />

                <StyledTextField
                  label="Numéro de Téléphone"
                  fullWidth
                  value={phoneNumber}
                  onChange={(e) => {
                    if (/^\d{0,8}$/.test(e.target.value)) {
                      setPhoneNumber(e.target.value);
                    }
                  }}
                  required
                  variant="outlined"
                  margin="normal"
                  placeholder="Ex: 06123456"
                  color="success"
                />

                <StyledTextField
                  label="Objet de la Réclamation"
                  fullWidth
                  value={claimObject}
                  onChange={(e) => setClaimObject(e.target.value)}
                  required
                  variant="outlined"
                  margin="normal"
                  placeholder="Ex: Produit endommagé"
                  color="success"
                />

                <StyledTextField
                  label="Description de la Réclamation"
                  fullWidth
                  multiline
                  rows={4}
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  required
                  variant="outlined"
                  margin="normal"
                  placeholder="Expliquez votre réclamation ici..."
                  color="success"
                />

                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>Motif</InputLabel>
                  <Select
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    required
                    color="success"
                  >
                    <MenuItem value="colis_endommage">Colis endommagé</MenuItem>
                    <MenuItem value="retard_livraison">Retard de livraison</MenuItem>
                    <MenuItem value="comportement_livreur">Comportement du livreur</MenuItem>
                    <MenuItem value="autre">Autre</MenuItem>
                  </Select>
                </FormControl>

                <StyledButton
                  type="submit"
                  variant="contained"
                  
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                </StyledButton>
              </form>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Snackbar open={!!alertMessage} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <Box className="footer" mt={3}>
        <Typography variant="body2" align="center" color="textSecondary" component="p">
          © {new Date().getFullYear()} Service de Livraison. Tous droits réservés.
        </Typography>
      </Box>
    </div>
  );
};

export default ClaimForm;
