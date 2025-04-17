/**
 * Configuração de temas da aplicação
 */
const getTheme = (mode) => {
  return {
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode
            primary: {
              main: '#1976d2',
              light: '#42a5f5',
              dark: '#1565c0',
            },
            secondary: {
              main: '#ff9800',
              light: '#ffb74d',
              dark: '#f57c00',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: '#212121',
              secondary: '#757575',
            },
            success: {
              main: '#4caf50',
              light: '#81c784',
              dark: '#388e3c',
            },
            warning: {
              main: '#ff9800',
              light: '#ffb74d',
              dark: '#f57c00',
            },
            error: {
              main: '#f44336',
              light: '#e57373',
              dark: '#d32f2f',
            },
            info: {
              main: '#2196f3',
              light: '#64b5f6',
              dark: '#1976d2',
            },
          }
        : {
            // Dark mode
            primary: {
              main: '#90caf9',
              light: '#e3f2fd',
              dark: '#42a5f5',
            },
            secondary: {
              main: '#ffb74d',
              light: '#ffd95b',
              dark: '#f57c00',
            },
            background: {
              default: '#121212',
              paper: '#212121',
            },
            text: {
              primary: '#e0e0e0',
              secondary: '#9e9e9e',
            },
            success: {
              main: '#66bb6a',
              light: '#81c784',
              dark: '#388e3c',
            },
            warning: {
              main: '#ffa726',
              light: '#ffb74d',
              dark: '#f57c00',
            },
            error: {
              main: '#f44336',
              light: '#e57373',
              dark: '#d32f2f',
            },
            info: {
              main: '#29b6f6',
              light: '#4fc3f7',
              dark: '#0288d1',
            },
          }),
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: [
        'Roboto',
        '"Noto Sans JP"',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 500,
      },
      h2: {
        fontWeight: 500,
      },
      h3: {
        fontWeight: 500,
      },
      h4: {
        fontWeight: 500,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  };
};

export default getTheme;