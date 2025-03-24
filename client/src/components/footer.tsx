import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 className="mb-3 font-heading">SPARKUR</h5>
            <p className="mb-3 small">
              The fastest food delivery service in your city, bringing your favorite meals right to your doorstep.
            </p>
            <div className="d-flex gap-2">
              <a href="#" className="text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-md-3 mb-4 mb-md-0">
            <h6 className="mb-3 font-heading">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/about" className="text-white text-decoration-none small">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/team" className="text-white text-decoration-none small">
                  Team
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/careers" className="text-white text-decoration-none small">
                  Careers
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/blog" className="text-white text-decoration-none small">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-md-3 mb-4 mb-md-0">
            <h6 className="mb-3 font-heading">For Restaurants</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/partner" className="text-white text-decoration-none small">
                  Partner with us
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/app-for-restaurants" className="text-white text-decoration-none small">
                  App for restaurants
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/business-model" className="text-white text-decoration-none small">
                  Business model
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-md-3">
            <h6 className="mb-3 font-heading">Contact Us</h6>
            <ul className="list-unstyled">
              <li className="mb-2 small d-flex align-items-center">
                <Mail className="h-4 w-4 me-2" /> support@sparkur.com
              </li>
              <li className="mb-2 small d-flex align-items-center">
                <Phone className="h-4 w-4 me-2" /> +91 80123 45678
              </li>
              <li className="small d-flex align-items-center">
                <MapPin className="h-4 w-4 me-2" /> 123 Tech Park, Bangalore, India
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="mt-4 mb-4" />
        
        <div className="row">
          <div className="col-md-6">
            <p className="small mb-md-0">&copy; 2023 SPARKUR. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <Link href="/privacy-policy" className="text-white text-decoration-none small me-3">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-white text-decoration-none small me-3">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="text-white text-decoration-none small">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
