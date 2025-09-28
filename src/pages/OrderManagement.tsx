import { useState, useEffect } from 'react';
import { useOrderManagement } from '@/contexts/OrderManagementContext';
import { orderManagementService } from '@/services/orderManagement';
import { orderSyncService } from '@/services/orderSync';
import type { Order } from '@/types/checkout';

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
};

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const nextStatusMap: Record<Order['status'], Order['status'] | null> = {
  pending: 'paid',
  paid: 'shipped',
  shipped: 'delivered',
  delivered: null,
  cancelled: null
};

export default function OrderManagement() {
  const { orders, updateOrderStatus, isLoading } = useOrderManagement();
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filters, setFilters] = useState({
    status: '' as Order['status'] | '',
    startDate: '',
    endDate: '',
    searchTerm: '',
    customerEmail: ''
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    ordersNeedingAction: 0
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadStats();
    applyFilters();
  }, [orders, filters]);

  const loadStats = async () => {
    try {
      const statsData = await orderManagementService.getStats();
      setStats({
        totalOrders: statsData.totalOrders,
        totalRevenue: statsData.totalRevenue,
        averageOrderValue: statsData.averageOrderValue,
        pendingOrders: statsData.pendingOrders,
        ordersNeedingAction: statsData.ordersNeedingAction
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const applyFilters = async () => {
    try {
      const filtered = await orderManagementService.getOrders({
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        searchTerm: filters.searchTerm || undefined,
        customerEmail: filters.customerEmail || undefined
      });
      setFilteredOrders(filtered);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      searchTerm: '',
      customerEmail: ''
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Update in the context
      await updateOrderStatus(orderId, newStatus);
      
      // Update in the service
      await orderManagementService.updateOrderStatus(orderId, newStatus);
      
      // Sync with customer's purchase history
      await orderSyncService.syncOrderStatus(orderId, newStatus, 'admin');
      
      console.log(`Status updated to ${newStatus} for order ${orderId}`);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const handleBulkStatusUpdate = async (status: Order['status']) => {
    if (selectedOrders.length === 0) return;
    
    try {
      // Update in the service
      await orderManagementService.bulkUpdateStatus(selectedOrders, status);
      
      // Sync each order with customer's purchase history
      for (const orderId of selectedOrders) {
        await orderSyncService.syncOrderStatus(orderId, status, 'admin');
      }
      
      setSelectedOrders([]);
      setShowBulkActions(false);
      await applyFilters();
      
      console.log(`Bulk status update completed for ${selectedOrders.length} orders`);
    } catch (error) {
      console.error('Erro ao atualizar status em lote:', error);
      alert('Erro ao atualizar status dos pedidos');
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    setSelectedOrders(filteredOrders.map(order => order.id));
  };

  const clearSelection = () => {
    setSelectedOrders([]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Pedidos</h1>
        <p className="text-gray-600">Gerencie todos os pedidos da sua loja</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Precisam Ação</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ordersNeedingAction}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="ID do pedido, produto..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email do Cliente</label>
            <input
              type="email"
              placeholder="cliente@email.com"
              value={filters.customerEmail}
              onChange={(e) => handleFilterChange('customerEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Ações em Lote */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-900">
                {selectedOrders.length} pedido(s) selecionado(s)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                Ações em Lote
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Limpar Seleção
              </button>
            </div>
          </div>
          
          {showBulkActions && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('paid')}
                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Marcar como Pago
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('shipped')}
                className="px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Marcar como Enviado
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('delivered')}
                className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Marcar como Entregue
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('cancelled')}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Pedidos ({filteredOrders.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={selectAllOrders}
              className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
            >
              Selecionar Todos
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Limpar Seleção
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {orders.length === 0 
                ? 'Ainda não há pedidos na sua loja.' 
                : 'Tente ajustar os filtros para encontrar pedidos.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrderSelection(order.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          Pedido #{order.id}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <p><strong>Data:</strong> {formatDate(order.createdAt)}</p>
                          <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                        </div>
                        <div>
                          <p><strong>Cliente:</strong> {order.customer.nome}</p>
                          <p><strong>Email:</strong> {order.customer.email}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Itens do Pedido:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>{item.productTitle} x {item.quantity}</span>
                              <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {nextStatusMap[order.status] && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, nextStatusMap[order.status]!)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusLabels[nextStatusMap[order.status]!]}
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
