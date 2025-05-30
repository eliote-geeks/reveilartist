import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './layout/Header';
import Footer from './layout/Footer';
import PageTransition from './common/PageTransition';
import FloatingActionButton from './common/FloatingActionButton';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Categories from './pages/Categories';
import ArtistProfile from './pages/ArtistProfile';
import Artists from './pages/Artists';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import TicketPurchase from './pages/TicketPurchase';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import SoundDetails from './pages/SoundDetails';
import Dashboard from './pages/Dashboard';
import AddSound from './pages/AddSound';
import AddEvent from './pages/AddEvent';

const App = () => {
    return (
        <div className="App">
            <Routes>
                {/* Dashboard Admin (sans Header/Footer) */}
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/add-sound" element={<AddSound />} />
                <Route path="/admin/add-event" element={<AddEvent />} />

                {/* Pages avec Header/Footer */}
                <Route path="/*" element={
                    <>
                        <Header />
                        <PageTransition>
                            <main>
                                <Routes>
                                    {/* Pages principales */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/catalog" element={<Catalog />} />
                                    <Route path="/categories" element={<Categories />} />
                                    <Route path="/sound/:id" element={<SoundDetails />} />

                                    {/* Artistes */}
                                    <Route path="/artists" element={<Artists />} />
                                    <Route path="/artist/:id" element={<ArtistProfile />} />

                                    {/* Événements */}
                                    <Route path="/events" element={<Events />} />
                                    <Route path="/event/:id" element={<EventDetails />} />
                                    <Route path="/ticket-purchase" element={<TicketPurchase />} />

                                    {/* Ajout de contenu pour tous les utilisateurs */}
                                    <Route path="/add-sound" element={<AddSound />} />
                                    <Route path="/add-event" element={<AddEvent />} />

                                    {/* Panier */}
                                    <Route path="/cart" element={<Cart />} />

                                    {/* Profil utilisateur */}
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/profile/edit" element={<ProfileEdit />} />

                                    {/* Authentification */}
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />

                                    {/* Contact */}
                                    <Route path="/contact" element={<Contact />} />
                                </Routes>
                            </main>
                        </PageTransition>
                        <Footer />
                        <FloatingActionButton />
                    </>
                } />
            </Routes>
        </div>
    );
};

export default App;
