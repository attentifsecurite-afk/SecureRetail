import React from 'react';
import {
  Shield, CheckCircle, ArrowRight, Play, Star, Users, Building2,
  Camera, Brain, Map, TrendingUp, Award, Zap, Lock, Globe,
  Phone, Mail, Calendar, ChevronRight, Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-900">SecureRetail</h1>
                <p className="text-xs text-slate-500 -mt-1">Ops Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">Fonctionnalités</a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">Tarifs</a>
              <a href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900">Témoignages</a>
              <a href="#contact" className="text-sm text-slate-600 hover:text-slate-900">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-slate-600 hover:text-slate-900">Connexion</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Démo gratuite
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              Nouveau : ShopGuard AI Engine intégré
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              La plateforme tout-en-un pour la
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"> sécurité retail</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Pilotez vos sites, caméras, agents et interventions depuis une interface unique.
              Intelligence artificielle, cartographie avancée et CRM intégré.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-600/25">
                Démarrer gratuitement
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 rounded-lg text-lg font-semibold hover:bg-slate-50 transition flex items-center gap-2 border border-slate-200">
                <Play size={20} />
                Voir la démo
              </button>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Essai 30 jours gratuit
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Sans engagement
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Support 24/7
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center text-xs text-slate-400">
                  secureretail-ops.fr/dashboard
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {[
                    { label: 'Sites actifs', value: '10', color: 'blue' },
                    { label: 'Caméras', value: '366', color: 'green' },
                    { label: 'Agents', value: '49', color: 'purple' },
                    { label: 'Score moyen', value: '88', color: 'orange' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200 h-32 flex items-center justify-center">
                  <p className="text-slate-400">Dashboard interactif</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Sites sécurisés', icon: Building2 },
              { value: '10K+', label: 'Caméras gérées', icon: Camera },
              { value: '99.9%', label: 'Disponibilité', icon: Zap },
              { value: '24/7', label: 'Support client', icon: Phone },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-blue-600" />
                  </div>
                  <p className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Tout ce dont vous avez besoin pour sécuriser vos sites
            </h2>
            <p className="text-xl text-slate-600">
              Une plateforme complète qui remplace vos outils dispersés
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'ShopGuard AI',
                description: 'Détection intelligente avec YOLO26, pose estimation et LLM Guard pour une analyse vidéo avancée.',
                color: 'purple',
              },
              {
                icon: Map,
                title: 'Cartographie avancée',
                description: 'Visualisez tous vos sites sur une carte interactive avec heatmap et zones de couverture.',
                color: 'blue',
              },
              {
                icon: Camera,
                title: 'Gestion caméras',
                description: 'Support ONVIF, RTSP, DVR, NVR. Toutes marques : Hikvision, Dahua, Axis, etc.',
                color: 'green',
              },
              {
                icon: Users,
                title: 'CRM intégré',
                description: 'Gérez vos contacts, contrats, installations et interventions depuis une seule interface.',
                color: 'orange',
              },
              {
                icon: Shield,
                title: 'Main courante',
                description: 'Journal électronique des événements avec catégorisation et traçabilité complète.',
                color: 'red',
              },
              {
                icon: TrendingUp,
                title: 'Reporting avancé',
                description: 'Dashboards direction et exploitation avec KPIs personnalisables et exports PDF.',
                color: 'cyan',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              const colorClasses: Record<string, string> = {
                purple: 'bg-purple-100 text-purple-600',
                blue: 'bg-blue-100 text-blue-600',
                green: 'bg-green-100 text-green-600',
                orange: 'bg-orange-100 text-orange-600',
                red: 'bg-red-100 text-red-600',
                cyan: 'bg-cyan-100 text-cyan-600',
              };
              return (
                <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[feature.color]}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 mb-4">{feature.description}</p>
                  <a href="#" className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    En savoir plus <ChevronRight size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Des tarifs adaptés à votre activité
            </h2>
            <p className="text-xl text-slate-600">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '299',
                description: 'Pour les petites équipes',
                features: [
                  'Jusqu\'à 5 sites',
                  '50 caméras',
                  'Main courante',
                  'Rondes & patrouilles',
                  'Support email',
                ],
                cta: 'Commencer',
                popular: false,
              },
              {
                name: 'Professional',
                price: '799',
                description: 'Pour les entreprises en croissance',
                features: [
                  'Jusqu\'à 20 sites',
                  '200 caméras',
                  'ShopGuard AI',
                  'CRM intégré',
                  'Cartographie avancée',
                  'Support prioritaire',
                  'API access',
                ],
                cta: 'Essai gratuit',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Sur mesure',
                description: 'Pour les grandes organisations',
                features: [
                  'Sites illimités',
                  'Caméras illimitées',
                  'Toutes les fonctionnalités',
                  'Support dédié 24/7',
                  'Formation sur site',
                  'SLA garanti',
                  'Développement custom',
                ],
                cta: 'Nous contacter',
                popular: false,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-2xl scale-105'
                    : 'bg-white border border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-4">
                    <Star size={12} />
                    Le plus populaire
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-white/80' : 'text-slate-600'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  {plan.price === 'Sur mesure' ? (
                    <p className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                      {plan.price}
                    </p>
                  ) : (
                    <>
                      <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                        {plan.price}€
                      </span>
                      <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-slate-600'}`}>/mois</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-2">
                      <CheckCircle size={18} className={plan.popular ? 'text-white' : 'text-green-500'} />
                      <span className={`text-sm ${plan.popular ? 'text-white/90' : 'text-slate-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-slate-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-slate-600">
              Découvrez comment SecureRetail Ops transforme la sécurité de nos clients
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'SecureRetail Ops a révolutionné notre gestion de la sécurité. Nous avons réduit les incidents de 40% en 6 mois.',
                author: 'Jean Dupont',
                role: 'Directeur Sûreté',
                company: 'Retail Group Paris',
                rating: 5,
              },
              {
                quote: 'L\'IA ShopGuard est impressionnante. La détection automatique nous a permis d\'identifier des comportements suspects que nous aurions manqués.',
                author: 'Sophie Martin',
                role: 'Responsable Sécurité',
                company: 'Luxury Brand',
                rating: 5,
              },
              {
                quote: 'Le CRM intégré nous a fait gagner un temps fou. Tout est centralisé, de la gestion des contrats aux interventions techniques.',
                author: 'Pierre Bernard',
                role: 'CEO',
                company: 'SecurTech Solutions',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-sm text-slate-500">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à sécuriser vos sites ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez les 500+ entreprises qui font confiance à SecureRetail Ops
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-slate-100 transition flex items-center gap-2">
              Démarrer l'essai gratuit
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-white/10 text-white rounded-lg text-lg font-semibold hover:bg-white/20 transition border border-white/30">
              Planifier une démo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold">SecureRetail</h3>
                  <p className="text-xs text-slate-400">Ops Platform</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                La plateforme de référence pour la sécurité retail en France.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">Intégrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Aide</a></li>
                <li><a href="#" className="hover:text-white">Statut</a></li>
                <li><a href="#" className="hover:text-white">Sécurité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">
              © 2026 SecureRetail Ops. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white">Confidentialité</a>
              <a href="#" className="hover:text-white">Conditions</a>
              <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
