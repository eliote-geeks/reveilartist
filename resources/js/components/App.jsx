import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import '../../css/app.css';

// Import des composants layout
import Header from './layout/Header';
import Footer from './layout/Footer';
import PageTransition from './common/PageTransition';
import FloatingActionButton from './common/FloatingActionButton';

// Import des composants d'authentification
import Login from './auth/Login';
import Register from './auth/Register';
import ProtectedRoute from './auth/ProtectedRoute';

// Import des pages principales
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';

// Import des pages de contenu
import Catalog from './pages/Catalog';
import Artists from './pages/Artists';
import ArtistProfile from './pages/ArtistProfile';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';

// Import des pages de détails
import SoundDetails from './pages/SoundDetails';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';

// Import des pages d'ajout/gestion
import AddSound from './pages/AddSound';
import AddEvent from './pages/AddEvent';
import EditSound from './pages/EditSound';
import EditEvent from './pages/EditEvent';
import Cart from './pages/Cart';
import TicketPurchase from './pages/TicketPurchase';
import Favorites from './pages/Favorites';

function App() {
    return (
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
                                    <Route path="/artist/:id" element={<ArtistProfile />} />
                                    <Route path="/events" element={<Events />} />
                                    <Route path="/event/:id" element={<EventDetails />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/category/:id" element={<CategoryDetail />} />
                        <Route path="/sound/:id" element={<SoundDetails />} />

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

                        <Route path="/edit-sound/:id" element={
                            <ProtectedRoute requiredRoles={['artist', 'producer', 'admin']}>
                                <EditSound />
                            </ProtectedRoute>
                        } />

                        <Route path="/edit-event/:id" element={
                            <ProtectedRoute requiredRoles={['artist', 'producer', 'admin']}>
                                <EditEvent />
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
    );
}

export default App;
