import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Charger le panier depuis localStorage au démarrage
    useEffect(() => {
        const savedCart = localStorage.getItem('reveilartist_cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);
            } catch (error) {
                console.error('Erreur lors du chargement du panier:', error);
                localStorage.removeItem('reveilartist_cart');
            }
        }
    }, []);

    // Sauvegarder le panier dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem('reveilartist_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Ajouter un item au panier
    const addToCart = (item) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(cartItem =>
                cartItem.id === item.id && cartItem.type === item.type
            );

            if (existingItem) {
                // Si l'item existe déjà, augmenter la quantité
                return prevItems.map(cartItem =>
                    cartItem.id === item.id && cartItem.type === item.type
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                // Ajouter un nouvel item
                const newItem = {
                    ...item,
                    quantity: 1,
                    addedAt: new Date().toISOString()
                };
                return [...prevItems, newItem];
            }
        });
    };

    // Retirer un item du panier
    const removeFromCart = (itemId, itemType) => {
        setCartItems(prevItems =>
            prevItems.filter(item => !(item.id === itemId && item.type === itemType))
        );
    };

    // Mettre à jour la quantité d'un item
    const updateQuantity = (itemId, itemType, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId, itemType);
            return;
        }

        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId && item.type === itemType
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    // Vider le panier
    const clearCart = () => {
        setCartItems([]);
    };

    // Obtenir le nombre total d'items
    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    // Obtenir le total des prix
    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            if (item.is_free || item.price === 0) return total;
            return total + (item.price * item.quantity);
        }, 0);
    };

    // Obtenir les items par type
    const getItemsByType = (type) => {
        return cartItems.filter(item => item.type === type);
    };

    // Vérifier si un item est dans le panier
    const isInCart = (itemId, itemType) => {
        return cartItems.some(item => item.id === itemId && item.type === itemType);
    };

    // Obtenir la quantité d'un item
    const getItemQuantity = (itemId, itemType) => {
        const item = cartItems.find(item => item.id === itemId && item.type === itemType);
        return item ? item.quantity : 0;
    };

    // Ouvrir/fermer le mini panier
    const toggleCart = () => {
        setIsOpen(!isOpen);
    };

    // Fermer le mini panier
    const closeCart = () => {
        setIsOpen(false);
    };

    const value = {
        cartItems,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getItemsByType,
        isInCart,
        getItemQuantity,
        toggleCart,
        closeCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
