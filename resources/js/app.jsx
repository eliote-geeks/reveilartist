import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/app.css';

// Import du contexte d'authentification
import { AuthProvider } from './context/AuthContext';

// Import des composants layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PageTransition from './components/common/PageTransition';
import FloatingActionButton from './components/common/FloatingActionButton';

// Import des composants d'authentification
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import des pages principales
import Home from './components/pages/Home';
import Dashboard from './components/pages/Dashboard';
import Contact from './components/pages/Contact';
import ForgotPassword from './components/pages/ForgotPassword';

// Import des pages de contenu
import Catalog from './components/pages/Catalog';
import Artists from './components/pages/Artists';
import ArtistProfile from './components/pages/ArtistProfile';
import Events from './components/pages/Events';
import EventDetails from './components/pages/EventDetails';
import Categories from './components/pages/Categories';

// Import des pages de détails
import SoundDetails from './components/pages/SoundDetails';
import Profile from './components/pages/Profile';
import ProfileEdit from './components/pages/ProfileEdit';

// Import des pages d'ajout/gestion
import AddSound from './components/pages/AddSound';
import AddEvent from './components/pages/AddEvent';
import Cart from './components/pages/Cart';
import TicketPurchase from './components/pages/TicketPurchase';
import Favorites from './components/pages/Favorites';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="d-flex flex-column min-vh-100">
                    <Header />
                    <main className="flex-grow-1">
                        <PageTransition>
                            <Routes>
                                {/* Pages publiques */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />

                                {/* Pages de contenu publiques */}
                                <Route path="/catalog" element={<Catalog />} />
                                <Route path="/artists" element={<Artists />} />
                                <Route path="/artists/:id" element={<ArtistProfile />} />
                                <Route path="/events" element={<Events />} />
                                <Route path="/events/:id" element={<EventDetails />} />
                                <Route path="/categories" element={<Categories />} />
                                <Route path="/sounds/:id" element={<SoundDetails />} />

                                {/* Pages protégées - nécessitent une authentification */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute requiredRoles={['admin']}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />

                                <Route path="/profile" element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                } />

                                <Route path="/profile/edit" element={
                                    <ProtectedRoute>
                                        <ProfileEdit />
                                    </ProtectedRoute>
                                } />

                                <Route path="/cart" element={
                                    <ProtectedRoute>
                                        <Cart />
                                    </ProtectedRoute>
                                } />

                                <Route path="/favorites" element={
                                    <ProtectedRoute>
                                        <Favorites />
                                    </ProtectedRoute>
                                } />

                                <Route path="/ticket-purchase/:eventId" element={
                                    <ProtectedRoute>
                                        <TicketPurchase />
                                    </ProtectedRoute>
                                } />

                                {/* Pages protégées - artistes et producteurs uniquement */}
                                <Route path="/add-sound" element={
                                    <ProtectedRoute requiredRoles={['artist', 'producer', 'admin']}>
                                        <AddSound />
                                    </ProtectedRoute>
                                } />

                                <Route path="/add-event" element={
                                    <ProtectedRoute requiredRoles={['artist', 'producer', 'admin']}>
                                        <AddEvent />
                                    </ProtectedRoute>
                                } />

                                {/* Redirection par défaut */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </PageTransition>
                    </main>
                    <Footer />

                    {/* Bouton flottant disponible sur toutes les pages */}
                    <FloatingActionButton />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
