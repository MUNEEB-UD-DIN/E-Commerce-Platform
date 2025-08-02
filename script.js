
        // Global variables
        let products = [];
        let cart = [];
        let orders = [];
        let currentPortal = 'user';
        let currentAdminTab = 'products';

        // Initialize the application
        function init() {
            loadData();
            displayProducts();
            updateCartBadge();
            updateAdminStats();
            switchPortal('user');
        }

       async function loadData() {
  const savedCart = localStorage.getItem('ecommerce_cart');
  const savedOrders = localStorage.getItem('ecommerce_orders');
  const savedProducts = localStorage.getItem('ecommerce_products');

  if (savedProducts) {
    products = JSON.parse(savedProducts);
  } else {
    try {
      const response = await fetch('products.json');
      if (!response.ok) throw new Error('Failed to load products.json');
      products = await response.json();
      saveData();
    } catch (error) {
      console.error('Error loading product data:', error);
      products = [];
    }
  }

  if (savedCart) {
    cart = JSON.parse(savedCart);
  }

  if (savedOrders) {
    orders = JSON.parse(savedOrders);
  }
}


        function saveData() {
            localStorage.setItem('ecommerce_products', JSON.stringify(products));
            localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
            localStorage.setItem('ecommerce_orders', JSON.stringify(orders));
        }

        // Portal Management
        function switchPortal(portal) {
            currentPortal = portal;
            const userPortal = document.getElementById('userPortal');
            const adminPortal = document.getElementById('adminPortal');
            const userBtn = document.getElementById('userPortalBtn');
            const adminBtn = document.getElementById('adminPortalBtn');
            const cartIcon = document.getElementById('cartIcon');

            if (portal === 'user') {
                userPortal.style.display = 'block';
                adminPortal.style.display = 'none';
                userBtn.className = 'bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition';
                adminBtn.className = 'bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition';
                cartIcon.style.display = 'block';
                displayProducts();
            } else {
                userPortal.style.display = 'none';
                adminPortal.style.display = 'block';
                userBtn.className = 'bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition';
                adminBtn.className = 'bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition';
                cartIcon.style.display = 'none';
                displayAdminProducts();
                displayOrders();
                updateAdminStats();
            }
        }

        function switchAdminTab(tab) {
            currentAdminTab = tab;
            const productsTab = document.getElementById('productsTab');
            const ordersTab = document.getElementById('ordersTab');
            const productsManagement = document.getElementById('productsManagement');
            const ordersManagement = document.getElementById('ordersManagement');

            if (tab === 'products') {
                productsTab.className = 'py-4 px-6 text-sm font-medium text-blue-600 border-b-2 border-blue-600';
                ordersTab.className = 'py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent';
                productsManagement.style.display = 'block';
                ordersManagement.style.display = 'none';
                displayAdminProducts();
            } else {
                productsTab.className = 'py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent';
                ordersTab.className = 'py-4 px-6 text-sm font-medium text-blue-600 border-b-2 border-blue-600';
                productsManagement.style.display = 'none';
                ordersManagement.style.display = 'block';
                displayOrders();
            }
        }

        // Product Display Functions
        function displayProducts() {
            const grid = document.getElementById('productsGrid');
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const categoryFilter = document.getElementById('categoryFilter').value;
            const sortBy = document.getElementById('sortBy').value;

            // Filter products
            let filteredProducts = products.filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                    product.description.toLowerCase().includes(searchTerm);
                const matchesCategory = !categoryFilter || product.category === categoryFilter;
                return matchesSearch && matchesCategory && product.stock > 0;
            });

            // Sort products
            filteredProducts.sort((a, b) => {
                switch(sortBy) {
                    case 'price-low': return a.price - b.price;
                    case 'price-high': return b.price - a.price;
                    case 'name':
                    default: return a.name.localeCompare(b.name);
                }
            });

            grid.innerHTML = filteredProducts.map(product => `
                <div class="product-card bg-white rounded-lg shadow-md overflow-hidden">
                    <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                         alt="${product.name}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                        <p class="text-gray-600 text-sm mb-3">${product.description}</p>
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-2xl font-bold text-blue-600">$${product.price}</span>
                            <span class="text-sm text-gray-500">${product.stock} in stock</span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="addToCart(${product.id})" 
                                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                                <i class="fas fa-cart-plus mr-2"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Update category filter options
            updateCategoryFilter();
        }

        function updateCategoryFilter() {
            const categoryFilter = document.getElementById('categoryFilter');
            const categories = [...new Set(products.map(p => p.category))];
            
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }

        function displayAdminProducts() {
            const table = document.getElementById('productsTable');
            table.innerHTML = products.map(product => `
                <tr>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <img src="${product.image || 'https://via.placeholder.com/50'}" 
                                 alt="${product.name}" class="w-12 h-12 object-cover rounded-lg mr-4">
                            <div>
                                <div class="font-medium">${product.name}</div>
                                <div class="text-sm text-gray-500">${product.description.substring(0, 50)}...</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4">${product.category}</td>
                    <td class="px-6 py-4">$${product.price}</td>
                    <td class="px-6 py-4">${product.stock}</td>
                    <td class="px-6 py-4">
                        <div class="flex space-x-2">
                            <button onclick="editProduct(${product.id})" 
                                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProduct(${product.id})" 
                                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Product Management Functions
        function openProductModal(productId = null) {
            const modal = document.getElementById('productModal');
            const form = document.getElementById('productForm');
            const title = document.getElementById('modalTitle');

            if (productId) {
                const product = products.find(p => p.id === productId);
                title.textContent = 'Edit Product';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productImage').value = product.image || '';
            } else {
                title.textContent = 'Add New Product';
                form.reset();
                document.getElementById('productId').value = '';
            }

            modal.classList.add('active');
        }

        function editProduct(id) {
            openProductModal(id);
        }

        function deleteProduct(id) {
            if (confirm('Are you sure you want to delete this product?')) {
                products = products.filter(p => p.id !== id);
                saveData();
                displayAdminProducts();
                updateAdminStats();
            }
        }

        // Cart Management
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            if (!product || product.stock <= 0) return;

            const existingItem = cart.find(item => item.productId === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ productId, quantity: 1 });
            }

            saveData();
            updateCartBadge();
            
            // Show success message
            showNotification('Product added to cart!', 'success');
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.productId !== productId);
            saveData();
            updateCartBadge();
            displayCart();
        }

        function updateCartQuantity(productId, quantity) {
            const item = cart.find(item => item.productId === productId);
            if (item) {
                if (quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    item.quantity = quantity;
                    saveData();
                    updateCartBadge();
                    displayCart();
                }
            }
        }

        function updateCartBadge() {
            const badge = document.getElementById('cartBadge');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalItems;
        }

        function openCart() {
            displayCart();
            document.getElementById('cartModal').classList.add('active');
        }

        function displayCart() {
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');

            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="text-gray-500 text-center py-8">Your cart is empty</p>';
                cartTotal.textContent = '0.00';
                return;
            }

            let total = 0;
            cartItems.innerHTML = cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return '';
                
                const itemTotal = product.price * item.quantity;
                total += itemTotal;

                return `
                    <div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <img src="${product.image || 'https://via.placeholder.com/80'}" 
                             alt="${product.name}" class="w-16 h-16 object-cover rounded">
                        <div class="flex-1">
                            <h4 class="font-semibold">${product.name}</h4>
                            <p class="text-gray-600">$${product.price}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})" 
                                    class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="w-8 text-center">${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})" 
                                    class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold">$${itemTotal.toFixed(2)}</p>
                            <button onclick="removeFromCart(${item.productId})" 
                                    class="text-red-600 hover:text-red-800 text-sm mt-1">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            cartTotal.textContent = total.toFixed(2);
        }

        function clearCart() {
            if (confirm('Are you sure you want to clear your cart?')) {
                cart = [];
                saveData();
                updateCartBadge();
                displayCart();
            }
        }

        function checkout() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }

            const total = cart.reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (product.price * item.quantity);
            }, 0);

            document.getElementById('checkoutTotal').textContent = total.toFixed(2);
            closeModal('cartModal');
            document.getElementById('checkoutModal').classList.add('active');
        }

        // Order Management
        function placeOrder(customerInfo) {
            const orderId = Date.now();
            const orderTotal = cart.reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (product.price * item.quantity);
            }, 0);

            const order = {
                id: orderId,
                customer: customerInfo,
                items: cart.map(item => ({
                    ...item,
                    product: products.find(p => p.id === item.productId)
                })),
                total: orderTotal,
                status: 'pending',
                date: new Date().toISOString()
            };

            orders.push(order);

            // Update product stock
            cart.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    product.stock -= item.quantity;
                }
            });

            cart = [];
            saveData();
            updateCartBadge();
            updateAdminStats();

            showNotification(`Order #${orderId} placed successfully!`, 'success');
            closeModal('checkoutModal');
        }

        function displayOrders() {
            const ordersList = document.getElementById('ordersList');
            const statusFilter = document.getElementById('orderStatusFilter').value;

            let filteredOrders = orders;
            if (statusFilter) {
                filteredOrders = orders.filter(order => order.status === statusFilter);
            }

            if (filteredOrders.length === 0) {
                ordersList.innerHTML = '<p class="text-gray-500 text-center py-8">No orders found</p>';
                return;
            }

            ordersList.innerHTML = filteredOrders.map(order => `
                <div class="bg-white border border-gray-200 rounded-lg p-6">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="font-semibold text-lg">Order #${order.id}</h4>
                            <p class="text-gray-600">${new Date(order.date).toLocaleDateString()}</p>
                            <p class="text-gray-600">${order.customer.name} - ${order.customer.email}</p>
                        </div>
                        <div class="text-right">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}">
                                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p class="text-lg font-bold mt-2">$${order.total.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="space-y-2 mb-4">
                        ${order.items.map(item => `
                            <div class="flex justify-between text-sm">
                                <span>${item.product.name} x${item.quantity}</span>
                                <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex space-x-2">
                        <select onchange="updateOrderStatus(${order.id}, this.value)" class="p-2 border border-gray-300 rounded">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                        <button onclick="deleteOrder(${order.id})" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition">
                            <i class="fas fa-trash mr-2"></i>Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function getStatusColor(status) {
            switch(status) {
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'processing': return 'bg-blue-100 text-blue-800';
                case 'shipped': return 'bg-purple-100 text-purple-800';
                case 'delivered': return 'bg-green-100 text-green-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        function updateOrderStatus(orderId, status) {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.status = status;
                saveData();
                displayOrders();
            }
        }

        function deleteOrder(orderId) {
            if (confirm('Are you sure you want to delete this order?')) {
                orders = orders.filter(o => o.id !== orderId);
                saveData();
                displayOrders();
                updateAdminStats();
            }
        }

        // Admin Statistics
        function updateAdminStats() {
            document.getElementById('totalProducts').textContent = products.length;
            document.getElementById('totalOrders').textContent = orders.length;
            
            const revenue = orders.reduce((sum, order) => sum + order.total, 0);
            document.getElementById('totalRevenue').textContent = `$${revenue.toFixed(2)}`;
            
            const categories = [...new Set(products.map(p => p.category))];
            document.getElementById('totalCategories').textContent = categories.length;
        }

        // Modal Management
        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // Notification System
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white ${
                type === 'success' ? 'bg-green-500' : 
                type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }

        // Event Listeners
        document.addEventListener('DOMContentLoaded', init);

        // Search and filter event listeners
        document.getElementById('searchInput').addEventListener('input', displayProducts);
        document.getElementById('categoryFilter').addEventListener('change', displayProducts);
        document.getElementById('sortBy').addEventListener('change', displayProducts);
        document.getElementById('orderStatusFilter').addEventListener('change', displayOrders);

        // Form event listeners
        document.getElementById('productForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const productData = {
                name: formData.get('productName') || document.getElementById('productName').value,
                description: formData.get('productDescription') || document.getElementById('productDescription').value,
                price: parseFloat(formData.get('productPrice') || document.getElementById('productPrice').value),
                category: formData.get('productCategory') || document.getElementById('productCategory').value,
                stock: parseInt(formData.get('productStock') || document.getElementById('productStock').value),
                image: formData.get('productImage') || document.getElementById('productImage').value
            };

            const productId = document.getElementById('productId').value;
            
            if (productId) {
                // Edit existing product
                const product = products.find(p => p.id === parseInt(productId));
                Object.assign(product, productData);
            } else {
                // Add new product
                productData.id = Math.max(...products.map(p => p.id), 0) + 1;
                products.push(productData);
            }

            saveData();
            displayAdminProducts();
            updateAdminStats();
            closeModal('productModal');
            showNotification(productId ? 'Product updated successfully!' : 'Product added successfully!', 'success');
        });

        document.getElementById('checkoutForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const customerInfo = {
                name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                phone: document.getElementById('customerPhone').value,
                address: document.getElementById('customerAddress').value
            };

            placeOrder(customerInfo);
            e.target.reset();
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });
