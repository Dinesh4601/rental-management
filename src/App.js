import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Download, TrendingUp, Package, Truck, RotateCcw, Clock, DollarSign } from 'lucide-react';

const RentalManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('inventory');
    return saved ? JSON.parse(saved) : [
      { id: 1, itemName: 'Chairs', quantity: 150, unitPrice: 50, minStock: 20, location: 'Warehouse A' },
      { id: 2, itemName: 'Tables (Round)', quantity: 45, unitPrice: 300, minStock: 5, location: 'Warehouse A' },
      { id: 3, itemName: 'Tables (Rectangular)', quantity: 35, unitPrice: 400, minStock: 5, location: 'Warehouse B' },
      { id: 4, itemName: 'Gas Stove', quantity: 12, unitPrice: 2000, minStock: 2, location: 'Kitchen Unit' },
      { id: 5, itemName: 'Cooking Vessels Set', quantity: 25, unitPrice: 1500, minStock: 3, location: 'Kitchen Unit' },
      { id: 6, itemName: 'Shamiana (20x30)', quantity: 8, unitPrice: 5000, minStock: 1, location: 'Special Items' },
      { id: 7, itemName: 'LED Lights', quantity: 200, unitPrice: 100, minStock: 30, location: 'Warehouse A' },
      { id: 8, itemName: 'Fans (Pedestal)', quantity: 30, unitPrice: 800, minStock: 5, location: 'Warehouse A' },
    ];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [returns, setReturns] = useState(() => {
    const saved = localStorage.getItem('returns');
    return saved ? JSON.parse(saved) : [];
  });

  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);

  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unitPrice: '',
    minStock: '',
    location: '',
  });

  const [orderData, setOrderData] = useState({
    orderId: '',
    customerName: '',
    phone: '',
    email: '',
    eventDate: '',
    dueDate: '',
    items: [],
    totalAmount: 0,
    status: 'pending',
    notes: '',
  });

  const [returnData, setReturnData] = useState({
    orderId: '',
    returnDate: '',
    itemsReturned: [],
    condition: 'good',
    notes: '',
  });

  const [itemInput, setItemInput] = useState({ itemId: '', qty: '', itemName: '' });
  const [returnItemInput, setReturnItemInput] = useState({ itemId: '', qty: '', itemName: '' });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('returns', JSON.stringify(returns));
  }, [returns]);

  // Inventory Management
  const handleAddInventory = () => {
    if (editingInventory) {
      setInventory(inventory.map(item => 
        item.id === editingInventory.id ? { ...item, ...formData } : item
      ));
      setEditingInventory(null);
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        minStock: parseInt(formData.minStock),
      };
      setInventory([...inventory, newItem]);
    }
    setFormData({ itemName: '', quantity: '', unitPrice: '', minStock: '', location: '' });
    setShowInventoryForm(false);
  };

  const handleDeleteInventory = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const handleEditInventory = (item) => {
    setFormData({
      itemName: item.itemName,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      minStock: item.minStock.toString(),
      location: item.location,
    });
    setEditingInventory(item);
    setShowInventoryForm(true);
  };

  // Order Management
  const handleAddOrderItem = () => {
    if (itemInput.itemId && itemInput.qty) {
      const item = inventory.find(i => i.id === parseInt(itemInput.itemId));
      if (item && parseInt(itemInput.qty) <= item.quantity) {
        const newItem = {
          itemId: parseInt(itemInput.itemId),
          itemName: item.itemName,
          quantity: parseInt(itemInput.qty),
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * parseInt(itemInput.qty),
        };
        const updatedItems = [...orderData.items, newItem];
        setOrderData({
          ...orderData,
          items: updatedItems,
          totalAmount: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
        });
        setItemInput({ itemId: '', qty: '', itemName: '' });
      } else {
        alert('Insufficient stock or invalid selection');
      }
    }
  };

  const handleRemoveOrderItem = (index) => {
    const updatedItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({
      ...orderData,
      items: updatedItems,
      totalAmount: updatedItems.reduce((sum, i) => sum + i.subtotal, 0),
    });
  };

  const handleCreateOrder = () => {
    if (orderData.customerName && orderData.eventDate && orderData.items.length > 0) {
      const newOrder = {
        ...orderData,
        orderId: `ORD-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
      };
      setOrders([...orders, newOrder]);
      
      // Update inventory
      orderData.items.forEach(item => {
        setInventory(inv => inv.map(i => 
          i.id === item.itemId ? { ...i, quantity: i.quantity - item.quantity } : i
        ));
      });

      setOrderData({
        orderId: '',
        customerName: '',
        phone: '',
        email: '',
        eventDate: '',
        dueDate: '',
        items: [],
        totalAmount: 0,
        status: 'pending',
        notes: '',
      });
      setShowOrderForm(false);
      alert('Order created successfully!');
    } else {
      alert('Please fill all required fields and add items');
    }
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleDeleteOrder = (orderId) => {
    const order = orders.find(o => o.orderId === orderId);
    if (order && order.status === 'returned') {
      setOrders(orders.filter(o => o.orderId !== orderId));
    } else {
      alert('Can only delete returned orders');
    }
  };

  // Return Management
  const handleAddReturnItem = () => {
    if (returnItemInput.itemId && returnItemInput.qty) {
      const item = inventory.find(i => i.id === parseInt(returnItemInput.itemId));
      if (item) {
        const newItem = {
          itemId: parseInt(returnItemInput.itemId),
          itemName: item.itemName,
          quantity: parseInt(returnItemInput.qty),
        };
        const updatedItems = [...returnData.itemsReturned, newItem];
        setReturnData({ ...returnData, itemsReturned: updatedItems });
        setReturnItemInput({ itemId: '', qty: '', itemName: '' });
      }
    }
  };

  const handleRemoveReturnItem = (index) => {
    const updatedItems = returnData.itemsReturned.filter((_, i) => i !== index);
    setReturnData({ ...returnData, itemsReturned: updatedItems });
  };

  const handleProcessReturn = () => {
    if (returnData.orderId && returnData.itemsReturned.length > 0) {
      const returnRecord = {
        ...returnData,
        returnId: `RET-${Date.now()}`,
        processDate: new Date().toISOString().split('T')[0],
      };
      setReturns([...returns, returnRecord]);

      // Update inventory
      returnData.itemsReturned.forEach(item => {
        setInventory(inv => inv.map(i => 
          i.id === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i
        ));
      });

      // Update order status
      setOrders(orders.map(order => 
        order.orderId === returnData.orderId ? { ...order, status: 'returned' } : order
      ));

      setReturnData({
        orderId: '',
        returnDate: '',
        itemsReturned: [],
        condition: 'good',
        notes: '',
      });
      setShowReturnForm(false);
      alert('Return processed successfully!');
    } else {
      alert('Please fill all required fields');
    }
  };

  // Export to CSV
  const exportToCSV = (data, filename) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${value}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Dashboard calculations
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched').length;
  const totalRevenue = orders.filter(o => o.status !== 'pending').reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Package size={32} color="#f97316" />
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>Event Rental Management</h1>
          </div>
          <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>Complete inventory, dispatch & return tracking system</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #e5e7eb',
        display: 'flex',
        gap: '32px',
        padding: '0 24px',
        maxWidth: '1400px',
        margin: '0 auto',
        overflowX: 'auto'
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'orders', label: 'Dispatch Orders', icon: Truck },
          { id: 'returns', label: 'Returns', icon: RotateCcw },
          { id: 'pending', label: 'Pending', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px 0',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === tab.id ? '#f97316' : '#6b7280',
                borderBottom: activeTab === tab.id ? '3px solid #f97316' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', gap: '24px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #f97316'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Total Items in Stock</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>{inventory.reduce((sum, i) => sum + i.quantity, 0)}</p>
              <p style={{ margin: '8px 0 0 0', color: '#10b981', fontSize: '12px' }}>Across {inventory.length} item types</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #10b981'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Inventory Value</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>₹{totalInventoryValue.toLocaleString()}</p>
              <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '12px' }}>Current stock cost</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #fcd34d'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Pending Orders</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>{pendingOrders}</p>
              <p style={{ margin: '8px 0 0 0', color: '#f59e0b', fontSize: '12px' }}>Awaiting dispatch</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #3b82f6'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Dispatched</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>{dispatchedOrders}</p>
              <p style={{ margin: '8px 0 0 0', color: '#3b82f6', fontSize: '12px' }}>Orders in field</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #10b981'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Total Revenue</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>₹{totalRevenue.toLocaleString()}</p>
              <p style={{ margin: '8px 0 0 0', color: '#10b981', fontSize: '12px' }}>From completed orders</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #ef4444'
            }}>
              <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Low Stock Alert</p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>{lowStockItems.length}</p>
              <p style={{ margin: '8px 0 0 0', color: '#ef4444', fontSize: '12px' }}>Items below minimum</p>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Master Inventory</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => exportToCSV(inventory, 'inventory')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} /> Export CSV
                </button>
                <button
                  onClick={() => { setShowInventoryForm(!showInventoryForm); setEditingInventory(null); }}
                  style={{
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>
            </div>

            {showInventoryForm && (
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #f97316'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  {editingInventory ? 'Edit Item' : 'Add New Item'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <input
                    placeholder="Item Name"
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    placeholder="Quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    placeholder="Unit Price (₹)"
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    placeholder="Min Stock Level"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                  <input
                    placeholder="Location/Warehouse"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleAddInventory}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {editingInventory ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    onClick={() => { setShowInventoryForm(false); setEditingInventory(null); }}
                    style={{
                      backgroundColor: '#e5e7eb',
                      color: '#1f2937',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Item Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Quantity</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Unit Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Stock Value</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Min Stock</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Location</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500', color: '#1f2937' }}>{item.itemName}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{item.quantity}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>₹{item.unitPrice}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#1f2937', fontWeight: '500' }}>₹{(item.quantity * item.unitPrice).toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{item.minStock}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: item.quantity <= item.minStock ? '#fee2e2' : '#dbeafe',
                          color: item.quantity <= item.minStock ? '#991b1b' : '#0c4a6e'
                        }}>
                          {item.quantity <= item.minStock ? '⚠️ Low' : '✓ OK'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{item.location}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditInventory(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#3b82f6',
                            padding: '4px'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteInventory(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            padding: '4px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Dispatch Orders</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => exportToCSV(orders, 'dispatch-orders')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} /> Export CSV
                </button>
                <button
                  onClick={() => setShowOrderForm(!showOrderForm)}
                  style={{
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} /> New Order
                </button>
              </div>
            </div>

            {showOrderForm && (
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #f97316'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Create New Order</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Customer Name *</label>
                    <input
                      placeholder="Customer Name"
                      value={orderData.customerName}
                      onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Phone</label>
                    <input
                      placeholder="Phone Number"
                      value={orderData.phone}
                      onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Email</label>
                    <input
                      placeholder="Email"
                      value={orderData.email}
                      onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Event Date *</label>
                    <input
                      type="date"
                      value={orderData.eventDate}
                      onChange={(e) => setOrderData({ ...orderData, eventDate: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Due Date</label>
                    <input
                      type="date"
                      value={orderData.dueDate}
                      onChange={(e) => setOrderData({ ...orderData, dueDate: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Add Items to Order</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '12px', marginBottom: '12px' }}>
                    <select
                      value={itemInput.itemId}
                      onChange={(e) => {
                        const item = inventory.find(i => i.id === parseInt(e.target.value));
                        setItemInput({ itemId: e.target.value, qty: itemInput.qty, itemName: item?.itemName || '' });
                      }}
                      style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    >
                      <option value="">Select Item</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.itemName} (Qty: {item.quantity})</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={itemInput.qty}
                      onChange={(e) => setItemInput({ ...itemInput, qty: e.target.value })}
                      style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <button
                      onClick={handleAddOrderItem}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {orderData.items.length > 0 && (
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '12px' }}>
                      {orderData.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < orderData.items.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '14px' }}>
                          <span>{item.itemName} x {item.quantity}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: '#6b7280' }}>₹{item.subtotal}</span>
                            <button
                              onClick={() => handleRemoveOrderItem(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div style={{ paddingTop: '12px', borderTop: '2px solid #e5e7eb', marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                        <span>Total Amount:</span>
                        <span style={{ color: '#f97316', fontSize: '16px' }}>₹{orderData.totalAmount}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Notes</label>
                  <textarea
                    placeholder="Special instructions, delivery notes, etc."
                    value={orderData.notes}
                    onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={handleCreateOrder}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Create Order
                  </button>
                  <button
                    onClick={() => setShowOrderForm(false)}
                    style={{
                      backgroundColor: '#e5e7eb',
                      color: '#1f2937',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '16px' }}>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <Truck size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>No orders yet. Create your first dispatch order!</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.orderId} style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid ' + (order.status === 'pending' ? '#fcd34d' : order.status === 'dispatched' ? '#3b82f6' : '#10b981')
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 100px', gap: '16px', marginBottom: '12px', fontSize: '14px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Order ID</p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>{order.orderId}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Customer</p>
                        <p style={{ margin: 0, color: '#1f2937' }}>{order.customerName}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Event Date</p>
                        <p style={{ margin: 0, color: '#1f2937' }}>{order.eventDate}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Total Amount</p>
                        <p style={{ margin: 0, color: '#f97316', fontWeight: '600' }}>₹{order.totalAmount}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.orderId, e.target.value)}
                          style={{
                            padding: '6px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: order.status === 'pending' ? '#fef3c7' : order.status === 'dispatched' ? '#dbeafe' : '#d1fae5',
                            color: order.status === 'pending' ? '#92400e' : order.status === 'dispatched' ? '#0c4a6e' : '#065f46',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="returned">Returned</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '13px', color: '#6b7280' }}>
                      <p style={{ margin: '0 0 4px 0' }}>Items: {order.items.map(i => `${i.itemName} (${i.quantity})`).join(', ')}</p>
                      {order.phone && <p style={{ margin: '0 0 4px 0' }}>Phone: {order.phone}</p>}
                      {order.notes && <p style={{ margin: 0 }}>Notes: {order.notes}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Returns Tab */}
        {activeTab === 'returns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Process Returns</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => exportToCSV(returns, 'returns')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} /> Export CSV
                </button>
                <button
                  onClick={() => setShowReturnForm(!showReturnForm)}
                  style={{
                    backgroundColor: '#f97316',
                    color: 'white',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={16} /> New Return
                </button>
              </div>
            </div>

            {showReturnForm && (
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '2px solid #f97316'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Process Return</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Select Order *</label>
                    <select
                      value={returnData.orderId}
                      onChange={(e) => setReturnData({ ...returnData, orderId: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    >
                      <option value="">Select Order</option>
                      {orders.filter(o => o.status !== 'returned').map(order => (
                        <option key={order.orderId} value={order.orderId}>
                          {order.orderId} - {order.customerName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Return Date *</label>
                    <input
                      type="date"
                      value={returnData.returnDate}
                      onChange={(e) => setReturnData({ ...returnData, returnDate: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Condition</label>
                    <select
                      value={returnData.condition}
                      onChange={(e) => setReturnData({ ...returnData, condition: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                    >
                      <option value="good">Good</option>
                      <option value="fair">Fair (Minor Damage)</option>
                      <option value="damaged">Damaged</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Items Returned</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: '12px', marginBottom: '12px' }}>
                    <select
                      value={returnItemInput.itemId}
                      onChange={(e) => {
                        const item = inventory.find(i => i.id === parseInt(e.target.value));
                        setReturnItemInput({ itemId: e.target.value, qty: returnItemInput.qty, itemName: item?.itemName || '' });
                      }}
                      style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    >
                      <option value="">Select Item</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.itemName}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={returnItemInput.qty}
                      onChange={(e) => setReturnItemInput({ ...returnItemInput, qty: e.target.value })}
                      style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                    />
                    <button
                      onClick={handleAddReturnItem}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {returnData.itemsReturned.length > 0 && (
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '12px' }}>
                      {returnData.itemsReturned.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < returnData.itemsReturned.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '14px' }}>
                          <span>{item.itemName} x {item.quantity}</span>
                          <button
                            onClick={() => handleRemoveReturnItem(idx)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#6b7280' }}>Notes</label>
                  <textarea
                    placeholder="Return notes, damage details, etc."
                    value={returnData.notes}
                    onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    onClick={handleProcessReturn}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Process Return
                  </button>
                  <button
                    onClick={() => setShowReturnForm(false)}
                    style={{
                      backgroundColor: '#e5e7eb',
                      color: '#1f2937',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '16px' }}>
              {returns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <RotateCcw size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>No returns processed yet.</p>
                </div>
              ) : (
                returns.map(ret => (
                  <div key={ret.returnId} style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #10b981'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '12px', fontSize: '14px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Return ID</p>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>{ret.returnId}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Order ID</p>
                        <p style={{ margin: 0, color: '#1f2937' }}>{ret.orderId}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Return Date</p>
                        <p style={{ margin: 0, color: '#1f2937' }}>{ret.returnDate}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Condition</p>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: ret.condition === 'good' ? '#d1fae5' : ret.condition === 'fair' ? '#fef3c7' : '#fee2e2',
                          color: ret.condition === 'good' ? '#065f46' : ret.condition === 'fair' ? '#92400e' : '#991b1b'
                        }}>
                          {ret.condition.charAt(0).toUpperCase() + ret.condition.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '13px', color: '#6b7280' }}>
                      <p style={{ margin: '0 0 4px 0' }}>Items: {ret.itemsReturned.map(i => `${i.itemName} (${i.quantity})`).join(', ')}</p>
                      {ret.notes && <p style={{ margin: 0 }}>Notes: {ret.notes}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Pending & Overdue Orders</h2>
              <button
                onClick={() => exportToCSV(orders.filter(o => ['pending', 'dispatched'].includes(o.status)), 'pending-orders')}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={16} /> Export CSV
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {orders.filter(o => ['pending', 'dispatched'].includes(o.status)).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <Clock size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>No pending orders!</p>
                </div>
              ) : (
                orders.filter(o => ['pending', 'dispatched'].includes(o.status)).map(order => {
                  const today = new Date().toISOString().split('T')[0];
                  const isOverdue = order.dueDate && order.dueDate < today;
                  
                  return (
                    <div key={order.orderId} style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      borderLeft: '4px solid ' + (isOverdue ? '#ef4444' : '#fcd34d')
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '12px', fontSize: '14px' }}>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Order ID</p>
                          <p style={{ margin: 0, fontWeight: '600', color: '#1f2937' }}>{order.orderId}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Customer</p>
                          <p style={{ margin: 0, color: '#1f2937' }}>{order.customerName}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Event Date</p>
                          <p style={{ margin: 0, color: '#1f2937' }}>{order.eventDate}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '12px', fontWeight: '600' }}>Due Date {isOverdue ? '⚠️' : ''}</p>
                          <p style={{ margin: 0, color: isOverdue ? '#ef4444' : '#1f2937', fontWeight: '600' }}>{order.dueDate}</p>
                        </div>
                      </div>
                      <div style={{ paddingTop: '12px', borderTop: '1px solid #e5e7eb', fontSize: '13px', color: '#6b7280' }}>
                        <p style={{ margin: '0 0 4px 0' }}>Status: <strong>{order.status.toUpperCase()}</strong></p>
                        <p style={{ margin: '0 0 4px 0' }}>Items: {order.items.map(i => `${i.itemName} (${i.quantity})`).join(', ')}</p>
                        <p style={{ margin: 0, color: '#f97316', fontWeight: '600' }}>Amount: ₹{order.totalAmount}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default RentalManagementSystem;
