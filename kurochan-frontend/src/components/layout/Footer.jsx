import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} Kurochan - {t('footer.allRightsReserved')}
          </Typography>
          <Box>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              {t('footer.termsOfService')}
            </Link>
            <Link href="#" color="inherit" sx={{ mx: 1 }}>
              {t('footer.privacyPolicy')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;