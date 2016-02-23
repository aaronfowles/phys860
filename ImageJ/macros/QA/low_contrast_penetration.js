// Get image
var im = IJ.getImage();

// Convert to RGB to 8-bit
IJ.run("8-bit");

// Get image properties
var dt = DicomTools();
var pixel_string = dt.getTag(im, "0028,0030");
pixel_string = pixel_string.substr(0,String(pixel_string).indexOf('\\'));

var pixel_dimension = parseFloat(pixel_string); // pixel length in mm
var im_height = im.getHeight(); // image height in pixels
var im_width =im.getWidth(); // image width in pixels

// Determine type of probe used to obtain image
var transducer_type = String(dt.getTag(im, "0018,6031")); // 'LINEAR' or 'CURVED LINEAR'

// Create layer to make annotations on
var im_annotate = IJ.getProcessor();

// Set midline of image
var midline = 0;

if (im_width % 2 == 0)
{
	midline = im_width / 2;
} else
{
	midline = (im_width + 1) / 2;
}

// Set 'zero' point at which probe meets phantom
var edge_cutoff = 5
var zero_y_pixel_val = 0;
var zero_y_mm_val = 0;

for (y = 0; y <= im_height / 2; y++)
{
	p = im.getPixel(midline,y);
	if (p[0] < edge_cutoff)
	{
		p = im.getPixel(midline,y+1)
		if(p[0] > edge_cutoff)
		{
			p = im.getPixel(midline,y+2);
			q = im.getPixel(midline,y+5);
			if(p[0] > edge_cutoff & q[0] > edge_cutoff)
			{
				zero_y_pixel_val = y+1;
				zero_y_mm_val = (y+1) * pixel_dimension;
				break;
			}
		}
	}
}

// Set 'max' point to which ultrasound beam penetrates
var max_y_pixel_val = 0;
var max_y_mm_val = 0;

for (y = im_height - 10; y >= im_height / 2; y--)
{
	var p = im.getPixel(midline,y);
	if (p[0] < edge_cutoff)
	{
		var p = im.getPixel(midline,y-1)
		if(p[0] > edge_cutoff)
		{
			var p = im.getPixel(midline,y-2)
			if(p[0] > edge_cutoff)
			{
				max_y_pixel_val = y-1;
				max_y_mm_val = (y-1) * pixel_dimension;
				break;
			}
		}
	}
}

// Create ROI
var width_roi_pixels = 20;
var depth_roi = Roi(midline-(width_roi_pixels/2),zero_y_pixel_val-1,width_roi_pixels,max_y_pixel_val-zero_y_pixel_val+2);

im_annotate.setColor(Color.yellow);
im_annotate.draw(depth_roi);
depth_roi.drawPixels(im_annotate);

// Obtain row averages of grey values
var mean_grey_at_depth = new Object(); // indices in pixels relative to 'zero'

for (y = zero_y_pixel_val; y <= max_y_pixel_val; y++)
{
	var i = y - zero_y_pixel_val;
	var running_sum = 0;
	var running_n = 0;
	for (x = midline - (width_roi_pixels/2); x <= midline + (width_roi_pixels/2); x++)
	{
		var p = im.getPixel(x,y);
		running_sum = running_sum + p[0]
		running_n = running_n + 1;
	}

	var running_mean = running_sum / running_n;
	mean_grey_at_depth[i] = running_mean;
}

// Deduce depth at which average grey values are a set proportion of values near zero
var cutoff_grey_proportion = 0;

if (transducer_type.substr(1,7) == "LINEAR")
{
	cutoff_grey_proportion = 0.7;
} else 
{
	cutoff_grey_proportion = 0.8;
}

estimated_cutoff = 0;
num_meeting_threshold = 0;

for (i in mean_grey_at_depth)
{
	if (mean_grey_at_depth[i] < mean_grey_at_depth[0]*cutoff_grey_proportion & i > 100)
	{
		num_meeting_threshold = num_meeting_threshold + 1;
		if (transducer_type.substr(1,7) == "LINEAR")
		{
			if (num_meeting_threshold == 5)
			{
				estimated_cutoff = i - 10;
				break;
			}
		} else
		{
		 	if (num_meeting_threshold == 5)
			{
				estimated_cutoff = i;
				break;
			}
		}		
	}
}

// Output results
var y_for_line = Number(estimated_cutoff) + Number(zero_y_pixel_val);
var line = Roi(0,y_for_line,im_width,1);

im_annotate.draw(line);
line.drawPixels(im_annotate);
im_annotate_image = ImagePlus("Annotated Image",im_annotate);

im_annotate_image.show();

popup = GenericDialog("Results");
results = "Low contrast penetration depth = " + estimated_cutoff + " pixels (" + estimated_cutoff*pixel_dimension + " mm)"
	 + " having mean grey of " + mean_grey_at_depth[estimated_cutoff] + " compared to baseline of " + mean_grey_at_depth[0];
popup.addMessage(results);
popup.showDialog();