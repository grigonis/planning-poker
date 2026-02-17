import React from 'react';
import footerLogo from '../../assets/banana-poker/footer-logo.svg';
import twitterIcon from '../../assets/banana-poker/social-twitter.svg';
import linkedinIcon from '../../assets/banana-poker/social-linkedin.svg';
import githubIcon from '../../assets/banana-poker/social-github.svg';

const Footer = () => {
    return (
        <footer className="w-full bg-[#0a0a0a] border-t border-white/5 py-16 text-sm font-heading">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-banana-500/40 flex items-center justify-center">
                                <img src={footerLogo} alt="Logo" className="w-3 h-3" />
                            </div>
                            <span className="text-lg font-bold text-white/60">AgilePlan</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed max-w-xs">
                            The ultimate planning poker tool for modern engineering teams. Built with precision for remote collaboration.
                        </p>
                    </div>

                    {/* Links: Product */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4">
                            {['Features', 'Integrations', 'Pricing', 'Roadmap'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links: Company */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Remote Teams', 'Privacy Policy', 'Terms of Service'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-xs">
                        © 2024 AgilePlan Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">
                            <img src={twitterIcon} alt="Twitter" className="w-4 h-4" />
                        </a>
                        <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">
                            <img src={linkedinIcon} alt="LinkedIn" className="w-4 h-4" />
                        </a>
                        <a href="#" className="opacity-60 hover:opacity-100 transition-opacity">
                            <img src={githubIcon} alt="GitHub" className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
