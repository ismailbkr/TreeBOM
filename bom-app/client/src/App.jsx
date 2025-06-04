import { useState, useEffect, useCallback } from 'react';
import { productAPI } from './services/api';
import './styles/global.css';

// İkonlar - Sabit boyutlarda
const SearchIcon = () => (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const PlusIcon = () => (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const RefreshIcon = () => (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const TreeIcon = () => (
    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21l3-3-3-3m4 6h9M5 3l3 3-3 3" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const TrashIcon = () => (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const MoveIcon = () => (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
);

const CubeIcon = () => (
    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

function App() {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Tüm ürünler (stats için)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);

    // Yeni ürün ekleme state'leri
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        parentId: null
    });
    const [parentProduct, setParentProduct] = useState(null);
    const [addingProduct, setAddingProduct] = useState(false);

    // Silme onay modalı state'leri
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(false);

    // Ürün taşıma modalı state'leri
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [productToMove, setProductToMove] = useState(null);
    const [selectedNewParent, setSelectedNewParent] = useState(null);
    const [movingProduct, setMovingProduct] = useState(false);
    const [availableParents, setAvailableParents] = useState([]);

    // Ürünleri ve istatistikleri yükle
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Root ürünleri ve tüm ürünleri paralel olarak çek
            const [rootResponse, allResponse] = await Promise.all([
                productAPI.getRootProducts(),
                productAPI.getAllProducts()
            ]);

            setProducts(rootResponse.data || []);
            setAllProducts(allResponse.data || []);
        } catch (err) {
            console.error('Ürünler yüklenirken hata:', err);
            setError('Sunucuya bağlanılamadı. Backend servisi çalışıyor mu?');
        } finally {
            setLoading(false);
        }
    }, []);

    // Arama fonksiyonu
    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            loadProducts();
            return;
        }

        try {
            setSearchLoading(true);
            setError(null);
            const response = await productAPI.searchProducts(searchQuery);
            setProducts(response.data || []);
        } catch (err) {
            console.error('Arama hatası:', err);
            setError('Arama yapılırken hata oluştu.');
        } finally {
            setSearchLoading(false);
        }
    }, [searchQuery, loadProducts]);

    // Yeni ürün ekleme modalını aç
    const openAddProductModal = (parent = null) => {
        setParentProduct(parent);
        setNewProduct({
            name: '',
            description: '',
            parentId: parent ? parent._id : null
        });
        setShowAddProductModal(true);
    };

    // Modal'ı kapat
    const closeAddProductModal = () => {
        setShowAddProductModal(false);
        setParentProduct(null);
        setNewProduct({
            name: '',
            description: '',
            parentId: null
        });
    };

    // Yeni ürün kaydet
    const handleAddProduct = async (e) => {
        e.preventDefault();

        if (!newProduct.name.trim()) {
            alert('Ürün adı zorunludur!');
            return;
        }

        try {
            setAddingProduct(true);
            await productAPI.createProduct(newProduct);
            closeAddProductModal();
            await loadProducts(); // Listeyi yenile
        } catch (err) {
            console.error('Ürün ekleme hatası:', err);
            alert('Ürün eklenemedi: ' + (err.response?.data?.error || err.message));
        } finally {
            setAddingProduct(false);
        }
    };

    // Ürün silme onay modalını aç
    const openDeleteModal = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    // Silme modalını kapat
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setProductToDelete(null);
    };

    // Ürün silme işlemi
    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        try {
            setDeletingProduct(true);
            await productAPI.deleteProduct(productToDelete._id);
            closeDeleteModal();
            await loadProducts(); // Listeyi yenile
        } catch (err) {
            console.error('Ürün silinirken hata:', err);
            alert('Ürün silinemedi: ' + (err.response?.data?.error || err.message));
        } finally {
            setDeletingProduct(false);
        }
    };

    // Ürün taşıma modalını aç
    const openMoveModal = async (product) => {
        setProductToMove(product);
        setSelectedNewParent(null);

        // Taşınabilir tüm ürünleri getir (kendi ve alt ürünleri hariç)
        try {
            const allResponse = await productAPI.getAllProducts();
            const filteredParents = (allResponse.data || []).filter(p => {
                // Kendisi ve kendi alt ürünleri olamaz
                return p._id !== product._id && !isDescendantOf(product._id, p._id, allResponse.data);
            });
            setAvailableParents(filteredParents);
        } catch (err) {
            console.error('Ürünler yüklenemedi:', err);
            setAvailableParents([]);
        }

        setShowMoveModal(true);
    };

    // Bir ürünün başka bir ürünün alt ürünü olup olmadığını kontrol et
    const isDescendantOf = (ancestorId, productId, allProducts) => {
        const findChildren = (parentId) => {
            return allProducts.filter(p => p.parentId === parentId);
        };

        const checkRecursive = (currentId) => {
            if (currentId === ancestorId) return true;
            const children = findChildren(currentId);
            return children.some(child => checkRecursive(child._id));
        };

        return checkRecursive(productId);
    };

    // Taşıma modalını kapat
    const closeMoveModal = () => {
        setShowMoveModal(false);
        setProductToMove(null);
        setSelectedNewParent(null);
        setAvailableParents([]);
    };

    // Ürün taşıma işlemi
    const handleMoveProduct = async () => {
        if (!productToMove) return;

        try {
            setMovingProduct(true);
            await productAPI.moveProduct(productToMove._id, selectedNewParent);
            closeMoveModal();
            await loadProducts(); // Listeyi yenile
        } catch (err) {
            console.error('Ürün taşınırken hata:', err);
            alert('Ürün taşınamadı: ' + (err.response?.data?.error || err.message));
        } finally {
            setMovingProduct(false);
        }
    };

    // İlk yükleme
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Arama debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, handleSearch]);

    return (
        <div style={{ minHeight: '100vh' }} className="bg-animated">
            {/* Header */}
            <header style={{
                position: 'relative',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                padding: '24px 0'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px'
                }}>
                    {/* Title Section */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                padding: '8px',
                                marginRight: '12px',
                                borderRadius: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(20px)'
                            }} className="animate-float">
                                <TreeIcon />
                            </div>
                            <h1 style={{
                                fontSize: '28px',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: 0
                            }}>
                                BOM Ürün Ağacı
                            </h1>
                        </div>
                        <p style={{
                            fontSize: '14px',
                            color: '#cbd5e1',
                            margin: '0 auto',
                            textAlign: 'center'
                        }}>
                            Hiyerarşik ürün yönetimi için gelişmiş platform
                        </p>
                    </div>

                    {/* Search & Actions */}
                    <div style={{
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                alignItems: 'center'
                            }}>
                                {/* Search Input */}
                                <div style={{
                                    position: 'relative',
                                    width: '100%'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none'
                                    }}>
                                        <SearchIcon />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Ürün ara..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        style={{
                                            width: '100%',
                                            paddingLeft: '40px',
                                            paddingRight: '16px',
                                            paddingTop: '8px',
                                            paddingBottom: '8px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                    {searchLoading && (
                                        <div style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)'
                                        }}>
                                            <div className="spinner"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center'
                                }}>
                                    <button
                                        onClick={handleSearch}
                                        disabled={searchLoading}
                                        className="btn btn-primary animate-glow"
                                    >
                                        <SearchIcon />
                                        Ara
                                    </button>

                                    <button
                                        onClick={() => openAddProductModal()}
                                        disabled={loading}
                                        className="btn btn-success"
                                    >
                                        <PlusIcon />
                                        Yeni Ana Ürün
                                    </button>

                                    <button
                                        onClick={loadProducts}
                                        disabled={loading}
                                        className="btn btn-secondary"
                                    >
                                        <RefreshIcon />
                                        Yenile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '32px 24px'
            }}>
                {/* Loading State */}
                {loading && products.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '64px 0'
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(20px)'
                            }}>
                                <div className="spinner"></div>
                            </div>
                        </div>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '8px',
                            textAlign: 'center'
                        }}>Veriler Yükleniyor</h2>
                        <p style={{
                            color: '#9ca3af',
                            textAlign: 'center'
                        }}>Ürün ağacı hazırlanıyor...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{
                        maxWidth: '500px',
                        margin: '0 auto 32px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.5)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#f87171',
                            marginBottom: '8px'
                        }}>
                            Bağlantı Hatası
                        </h3>
                        <p style={{
                            color: '#d1d5db',
                            marginBottom: '12px',
                            fontSize: '14px'
                        }}>{error}</p>
                        <button
                            onClick={() => setError(null)}
                            style={{
                                fontSize: '12px',
                                color: '#f87171',
                                background: 'none',
                                border: 'none',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}
                        >
                            Hatayı kapat
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                {!error && products.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '32px'
                    }} className="animate-fade-in">
                        <StatsCard
                            title="Toplam Ürün"
                            value={allProducts.length}
                            icon={<CubeIcon />}
                            color="from-blue-500 to-purple-600"
                        />
                        <StatsCard
                            title="Ana Ürün"
                            value={products.length}
                            icon="🌳"
                            color="from-green-500 to-teal-600"
                        />
                        <StatsCard
                            title="Alt Bileşenler"
                            value={allProducts.length - products.length}
                            icon="📦"
                            color="from-orange-500 to-red-600"
                        />
                    </div>
                )}

                {/* Products Section */}
                <div style={{ marginTop: '32px' }}>
                    {/* Section Header */}
                    {products.length > 0 && (
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '24px'
                        }} className="animate-slide-left">
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: 'white',
                                marginBottom: '8px'
                            }}>
                                {searchQuery ? 'Arama Sonuçları' : 'Ürün Ağacı'}
                            </h2>
                            <p style={{
                                color: '#9ca3af',
                                fontSize: '14px'
                            }}>
                                {searchQuery
                                    ? `"${searchQuery}" için ${products.length} sonuç`
                                    : `${products.length} kök ürün listeleniyor`
                                }
                            </p>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '12px'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#10b981'
                                }} className="animate-pulse"></div>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#9ca3af'
                                }}>Canlı Veri</span>
                            </div>
                        </div>
                    )}

                    {/* Products Grid or Empty State */}
                    {products.length === 0 && !loading ? (
                        <EmptyState
                            onCreateProduct={() => openAddProductModal()}
                            searchQuery={searchQuery}
                        />
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    onUpdate={loadProducts}
                                    onAddSubProduct={openAddProductModal}
                                    onDeleteProduct={openDeleteModal}
                                    onMoveProduct={openMoveModal}
                                    autoExpandTrigger={searchQuery.length > 0}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                marginTop: '64px',
                padding: '32px 0'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '24px',
                        textAlign: 'center'
                    }}>
                        <div>
                            <h4 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: '12px'
                            }}>
                                🟢 Sistem Durumu
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                fontSize: '12px',
                                color: '#9ca3af'
                            }}>
                                <div>Backend: Aktif</div>
                                <div>Veritabanı: Bağlı</div>
                                <div>API: Çalışıyor</div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: '12px'
                            }}>
                                ⚙️ Teknolojiler
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                fontSize: '12px',
                                color: '#9ca3af'
                            }}>
                                <div>React 18 + Vite</div>
                                <div>Node.js + Express</div>
                                <div>MongoDB </div>
                                <div>Tailwind CSS</div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: '12px'
                            }}>
                                ✨ Özellikler
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                fontSize: '12px',
                                color: '#9ca3af'
                            }}>
                                <div>Hiyerarşik Yönetim</div>
                                <div>Gerçek Zamanlı Arama</div>
                                <div>Modern UI/UX</div>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '32px',
                        paddingTop: '24px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        textAlign: 'center'
                    }}>
                        <p style={{
                            color: '#9ca3af',
                            fontSize: '12px'
                        }}>
                            © 2025 BOM Ürün Ağacı Sistemi - Gelişmiş Hiyerarşik Yönetim Platformu
                        </p>
                    </div>
                </div>
            </footer>

            {/* Ürün Ekleme Modalı */}
            {showAddProductModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }} onClick={closeAddProductModal}>
                    <div style={{
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: 'white',
                                margin: 0
                            }}>
                                {parentProduct ? `${parentProduct.name} - Alt Ürün Ekle` : 'Yeni Ana Ürün Ekle'}
                            </h2>
                            <button
                                onClick={closeAddProductModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {parentProduct && (
                            <div style={{
                                background: 'rgba(59,130,246,0.1)',
                                border: '1px solid rgba(59,130,246,0.3)',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#93c5fd',
                                    marginBottom: '4px'
                                }}>
                                    Ana Ürün:
                                </div>
                                <div style={{
                                    color: 'white',
                                    fontWeight: '500'
                                }}>
                                    {parentProduct.name}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleAddProduct}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    color: 'white',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    Ürün Adı *
                                </label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({
                                        ...newProduct,
                                        name: e.target.value
                                    })}
                                    placeholder="Ürün adını girin..."
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    color: 'white',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    Açıklama
                                </label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({
                                        ...newProduct,
                                        description: e.target.value
                                    })}
                                    placeholder="Ürün açıklaması (isteğe bağlı)..."
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <button
                                    type="button"
                                    onClick={closeAddProductModal}
                                    style={{
                                        padding: '12px 20px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingProduct}
                                    style={{
                                        padding: '12px 20px',
                                        background: addingProduct ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.8)',
                                        border: '1px solid rgba(59,130,246,0.6)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontSize: '14px',
                                        cursor: addingProduct ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {addingProduct ? (
                                        <>
                                            <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                            Ekleniyor...
                                        </>
                                    ) : (
                                        <>
                                            <PlusIcon />
                                            Ürün Ekle
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Silme Onay Modalı */}
            {showDeleteModal && productToDelete && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }} onClick={closeDeleteModal}>
                    <div style={{
                        background: 'rgba(15,15,15,0.95)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '450px',
                        width: '100%'
                    }} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: 'rgba(239,68,68,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '16px'
                            }}>
                                <svg style={{ width: '24px', height: '24px', color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5l1.5 1.5A1 1 0 0117 13h-2v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4H3a1 1 0 01-.5-1.5L4 11.5V5zM7 15v2h6v-2H7z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    margin: 0,
                                    marginBottom: '4px'
                                }}>
                                    Ürünü Sil
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#9ca3af',
                                    margin: 0
                                }}>
                                    Bu işlem geri alınamaz
                                </p>
                            </div>
                        </div>

                        {/* Ürün Bilgisi */}
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                marginBottom: '4px'
                            }}>
                                {productToDelete.name}
                            </div>
                            {productToDelete.description && (
                                <div style={{
                                    fontSize: '14px',
                                    color: '#d1d5db'
                                }}>
                                    {productToDelete.description}
                                </div>
                            )}
                            {productToDelete.childrenCount > 0 && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '8px 12px',
                                    background: 'rgba(251,191,36,0.2)',
                                    border: '1px solid rgba(251,191,36,0.3)',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#fbbf24'
                                }}>
                                    ⚠️ Bu ürünün {productToDelete.childrenCount} alt ürünü var. Silinince alt ürünler ana seviyeye taşınacak.
                                </div>
                            )}
                        </div>

                        <div style={{
                            fontSize: '14px',
                            color: '#d1d5db',
                            marginBottom: '24px',
                            lineHeight: '1.5'
                        }}>
                            <strong>"{productToDelete.name}"</strong> ürününü kalıcı olarak silmek istediğinizden emin misiniz?
                        </div>

                        {/* Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                style={{
                                    padding: '12px 20px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                disabled={deletingProduct}
                                style={{
                                    padding: '12px 20px',
                                    background: deletingProduct ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.8)',
                                    border: '1px solid rgba(239,68,68,0.6)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: deletingProduct ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {deletingProduct ? (
                                    <>
                                        <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                                        Siliniyor...
                                    </>
                                ) : (
                                    <>
                                        <TrashIcon />
                                        Evet, Sil
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Taşıma Modal */}
            {showMoveModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <h2 style={{
                            margin: '0 0 16px 0',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                        }}>
                            Ürün Taşı: {productToMove?.name}
                        </h2>

                        <p style={{
                            margin: '0 0 16px 0',
                            color: '#6b7280',
                            fontSize: '14px'
                        }}>
                            Bu ürünü hangi ürünün alt ürünü yapmak istiyorsunuz?
                            Kök seviye için "Ana Ürün Yap" seçeneğini kullanın.
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Yeni Ana Ürün:
                            </label>

                            <div style={{ marginBottom: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedNewParent(null)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: selectedNewParent === null ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                                        borderRadius: '6px',
                                        backgroundColor: selectedNewParent === null ? '#eff6ff' : 'white',
                                        color: selectedNewParent === null ? '#1d4ed8' : '#374151',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontSize: '14px'
                                    }}
                                >
                                    🏠 Ana Ürün Yap (Kök Seviye)
                                </button>
                            </div>

                            <div style={{
                                maxHeight: '200px',
                                overflowY: 'auto',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                padding: '4px'
                            }}>
                                {availableParents.map((parent) => (
                                    <button
                                        key={parent._id}
                                        type="button"
                                        onClick={() => setSelectedNewParent(parent._id)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: selectedNewParent === parent._id ? '2px solid #3b82f6' : '2px solid transparent',
                                            borderRadius: '4px',
                                            backgroundColor: selectedNewParent === parent._id ? '#eff6ff' : 'transparent',
                                            color: selectedNewParent === parent._id ? '#1d4ed8' : '#374151',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            marginBottom: '2px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {'  '.repeat(parent.level || 0)}
                                        {parent.level > 0 ? '└─ ' : '📦 '}
                                        {parent.name}
                                        {parent.description && (
                                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                                                {' '}- {parent.description}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                type="button"
                                onClick={closeMoveModal}
                                disabled={movingProduct}
                                style={{
                                    padding: '8px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    cursor: movingProduct ? 'not-allowed' : 'pointer',
                                    opacity: movingProduct ? 0.6 : 1
                                }}
                            >
                                İptal
                            </button>
                            <button
                                type="button"
                                onClick={handleMoveProduct}
                                disabled={movingProduct}
                                style={{
                                    padding: '8px 16px',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '6px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    cursor: movingProduct ? 'not-allowed' : 'pointer',
                                    opacity: movingProduct ? 0.6 : 1
                                }}
                            >
                                {movingProduct ? 'Taşınıyor...' : 'Taşı'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// İstatistik Kartı Bileşeni
function StatsCard({ title, value, icon, color }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            transition: 'transform 0.3s ease'
        }} className="card-glass">
            <div style={{
                fontSize: '18px',
                padding: '8px',
                borderRadius: '8px',
                display: 'inline-block',
                marginBottom: '8px',
                background: `linear-gradient(135deg, ${color.includes('blue') ? '#3b82f6, #8b5cf6' : color.includes('green') ? '#10b981, #14b8a6' : color.includes('orange') ? '#f97316, #ef4444' : '#ec4899, #f43f5e'})`
            }}>
                {typeof icon === 'string' ? icon : icon}
            </div>
            <p style={{
                color: '#9ca3af',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '4px'
            }}>{title}</p>
            <p style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'white'
            }}>{value}</p>
        </div>
    );
}

// Boş Durum Bileşeni  
function EmptyState({ onCreateProduct, searchQuery }) {
    const isSearchResult = searchQuery && searchQuery.trim() !== '';

    return (
        <div style={{
            textAlign: 'center',
            padding: '64px 0'
        }} className="animate-fade-in">
            <div style={{
                maxWidth: '400px',
                margin: '0 auto'
            }}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(20px)',
                        marginBottom: '16px'
                    }} className="animate-float">
                        <span style={{ fontSize: '48px' }}>
                            {isSearchResult ? '🔍' : '📦'}
                        </span>
                    </div>
                </div>

                <h3 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '12px'
                }}>
                    {isSearchResult ? 'Sonuç Bulunamadı' : 'Ürün Ağacınızı Oluşturun'}
                </h3>

                <p style={{
                    color: '#9ca3af',
                    marginBottom: '24px',
                    fontSize: '14px'
                }}>
                    {isSearchResult
                        ? `"${searchQuery}" için herhangi bir ürün bulunamadı.`
                        : 'Henüz hiç ürün yok. İlk ürününüzü oluşturarak başlayın.'
                    }
                </p>

                <button
                    onClick={onCreateProduct}
                    className="btn btn-primary animate-glow"
                >
                    <PlusIcon />
                    {isSearchResult ? 'Yeni Ürün Oluştur' : 'İlk Ürünü Oluştur'}
                </button>

                {!isSearchResult && (
                    <div style={{
                        marginTop: '32px',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(20px)'
                    }}>
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white',
                            marginBottom: '12px'
                        }}>💡 İpuçları</h4>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            fontSize: '12px',
                            color: '#9ca3af'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#3b82f6'
                                }}></span>
                                <span>Ürünleri hiyerarşik olarak organize edin</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#10b981'
                                }}></span>
                                <span>Alt bileşenleri kolayca yönetin</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#8b5cf6'
                                }}></span>
                                <span>Gelişmiş arama ile hızlıca bulun</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Ürün Kartı Bileşeni
function ProductCard({ product, depth = 0, onUpdate, autoExpandTrigger = false, onAddSubProduct, onDeleteProduct, onMoveProduct }) {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState([]);
    const [loadingChildren, setLoadingChildren] = useState(false);
    const [autoExpanded, setAutoExpanded] = useState(false);
    const [triggerProcessed, setTriggerProcessed] = useState(false);

    const depthColors = [
        '#3b82f6',
        '#10b981',
        '#f97316',
        '#ec4899',
        '#6366f1'
    ];

    const currentColor = depthColors[depth % depthColors.length];
    const marginLeft = depth * 16;

    // Alt ürünleri yükle - Basit yükleme
    const loadChildren = async () => {
        if (product.childrenCount === 0 || children.length > 0) return;

        try {
            setLoadingChildren(true);
            const response = await productAPI.getProductChildren(product._id);
            setChildren(response.data || []);
        } catch (err) {
            console.error('Alt ürünler yüklenemedi:', err);
        } finally {
            setLoadingChildren(false);
        }
    };

    // Tüm ağacı recursive olarak genişlet - Ana ürüne tıklayınca tüm alt ürünler açılsın
    const expandAllTree = async () => {
        if (expanded || product.childrenCount === 0) return;

        try {
            setLoadingChildren(true);

            // Önce bu seviyedeki çocukları yükle
            const response = await productAPI.getProductChildren(product._id);
            const childrenData = response.data || [];
            setChildren(childrenData);
            setExpanded(true);
            setAutoExpanded(true);

        } catch (err) {
            console.error('Alt ürünler yüklenemedi:', err);
        } finally {
            setLoadingChildren(false);
        }
    };

    const toggleExpanded = () => {
        if (!expanded) {
            // Açarken: Ana ürün ise tüm ağacı aç, alt ürün ise sadece kendini aç
            if (depth === 0) {
                expandAllTree(); // Ana ürün - tüm ağacı aç
            } else {
                // Alt ürün - sadece kendini aç
                setExpanded(true);
                if (children.length === 0) {
                    loadChildren();
                }
            }
        } else {
            // Kapatırken tüm state'leri temizle
            setExpanded(false);
            setAutoExpanded(false);
        }
    };

    // Otomatik ağaç genişletme - CASCADE etkisi
    useEffect(() => {
        if (autoExpandTrigger && product.childrenCount > 0 && !expanded && !triggerProcessed) {
            // Kademeli gecikme ile otomatik aç
            const timer = setTimeout(() => {
                // Kendi state'ini bağımsız şekilde set et
                setExpanded(true);
                setAutoExpanded(true);
                setTriggerProcessed(true); // Trigger işlendi olarak işaretle

                // Eğer children yüklenmemişse yükle
                if (children.length === 0) {
                    loadChildren();
                }
            }, 100 * (depth + 1)); // Her seviye için artan gecikme
            return () => clearTimeout(timer);
        }
    }, [autoExpandTrigger, product.childrenCount, expanded, triggerProcessed, depth]);

    // Trigger reset - autoExpandTrigger false olduğunda trigger'ı sıfırla
    useEffect(() => {
        if (!autoExpandTrigger) {
            setTriggerProcessed(false);
        }
    }, [autoExpandTrigger]);

    return (
        <div style={{ marginLeft: `${marginLeft}px` }}>
            <div style={{
                position: 'relative',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '12px',
                transition: 'transform 0.3s ease',
                opacity: 1
            }} className="card-glass group">
                {/* Depth Indicator */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '4px',
                    height: '100%',
                    background: currentColor,
                    borderTopLeftRadius: '12px',
                    borderBottomLeftRadius: '12px'
                }}></div>

                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                }}>
                    <div style={{
                        flex: 1,
                        minWidth: 0
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                        }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: 'white',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {product.name}
                            </h3>

                            {product.childrenCount > 0 && (
                                <span style={{
                                    padding: '2px 8px',
                                    background: 'rgba(59,130,246,0.2)',
                                    color: '#93c5fd',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    {product.childrenCount} alt
                                </span>
                            )}
                        </div>

                        {product.description && (
                            <p style={{
                                color: '#9ca3af',
                                marginBottom: '8px',
                                fontSize: '12px',
                                lineHeight: '1.5'
                            }}>
                                {product.description}
                            </p>
                        )}

                        {/* Seviye ve ID bilgilerini gizledik - artık gösterilmiyor */}
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginLeft: '12px'
                    }}>
                        {/* Alt Ürün Ekle Butonu */}
                        <button
                            onClick={() => onAddSubProduct && onAddSubProduct(product)}
                            style={{
                                padding: '4px',
                                borderRadius: '4px',
                                background: 'rgba(34,197,94,0.2)',
                                color: '#4ade80',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            title="Alt Ürün Ekle"
                        >
                            <PlusIcon />
                        </button>

                        {product.childrenCount > 0 && (
                            <button
                                onClick={toggleExpanded}
                                style={{
                                    padding: '4px',
                                    borderRadius: '4px',
                                    background: expanded ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.1)',
                                    color: expanded ? '#93c5fd' : '#9ca3af',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                title={expanded ? 'Tüm Alt Ağacı Kapat' : 'Tüm Alt Ağacı Aç'}
                            >
                                <div style={{
                                    transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease'
                                }}>
                                    <ChevronRightIcon />
                                </div>
                            </button>
                        )}

                        {/* Silme butonu artık her zaman görünür */}
                        <button
                            onClick={() => onDeleteProduct(product)}
                            title="Ürünü Sil"
                            style={{
                                padding: '4px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <TrashIcon />
                        </button>

                        <button
                            onClick={() => onMoveProduct(product)}
                            title="Ürünü Taşı"
                            style={{
                                padding: '4px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: '#fef3c7',
                                color: '#d97706',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <MoveIcon />
                        </button>
                    </div>
                </div>

                {/* Children Section - Accordion */}
                {expanded && (
                    <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }} className="animate-slide-down">
                        {loadingChildren ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '16px 0',
                                color: '#9ca3af'
                            }}>
                                <div className="spinner" style={{ marginRight: '8px' }}></div>
                                <span style={{ fontSize: '12px' }}>Tüm alt ağaç yükleniyor...</span>
                            </div>
                        ) : children.length > 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                            }}>
                                {children.map((child, index) => (
                                    <div
                                        key={child._id}
                                        className="animate-slide-down"
                                        style={{
                                            animationDelay: `${index * 30}ms`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <ProductCard
                                            product={child}
                                            depth={depth + 1}
                                            onUpdate={onUpdate}
                                            autoExpandTrigger={autoExpanded}
                                            onAddSubProduct={onAddSubProduct}
                                            onDeleteProduct={onDeleteProduct}
                                            onMoveProduct={onMoveProduct}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: '12px 0',
                                textAlign: 'center',
                                color: '#6b7280',
                                fontSize: '12px'
                            }}>
                                Alt ürün bulunamadı
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App; 