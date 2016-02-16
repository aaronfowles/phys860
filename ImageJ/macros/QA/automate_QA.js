// Get reference to loaded image - currently testing on DISC1 image 4
im = IJ.getImage();

// Get pixel dimensions from DICOM header
dt = DicomTools();
pixel_string = dt.getTag(im, "0028,0030");
pixel_string = pixel_string.substr(0,String(pixel_string).indexOf('\\'));
pixel_dimension = parseFloat(pixel_string);

im_height = im.getHeight();
im_width =im.getWidth();

// Convert to 8-bit
IJ.run("8-bit");

// Create binary pixel map mask, initialised to zeros
binary_mask = new Array();
for (i = 0; i < im_height; i++)
{
	binary_mask[i] = new Array();
	for (j = 0; j < im_width; j++)
	{
		 binary_mask[i][j] = 0;
	}
}

// Create ROIs based on known properties of the phantom


// For each ROI, calculate summary statistics of each row/column and select likely pin pixels


// Identify pins and label binary pixel map
threshold_val = 100;
depth_coefficient = 1;
neighbour_coefficient = 0.5;

neighbs_count = [];
neighbs_count[0] = 0;
neighbs_count[1] = 0;
neighbs_count[2] = 0;
neighbs_count[3] = 0;
neighbs_count[4] = 0;
neighbs_count[5] = 0;
neighbs_count[6] = 0;
neighbs_count[7] = 0;
neighbs_count[8] = 0;

for (i = 0; i < im_height; i++)
{
	for (j = 0; j < im_width; j++)
	{
		var neighbours = 0;
		p = im.getPixel(j,i);
		if (p[0] > threshold_val) // check if pixel exceeds threhold value
		{
		 	if ((i > 0) && (i < im_height-1) && (j > 0) && (j < im_width-1))
		 	{
		 		var left_upper = im.getPixel(j-1,i-1);
		 		var right_upper = im.getPixel(j+1,i-1);
		 		var left = im.getPixel(j-1,i);
		 		var right = im.getPixel(j+1,i);
		 		var above = im.getPixel(j,i-1);
		 		var below = im.getPixel(j,i+1);
		 		var left_lower = im.getPixel(j-1,i+1);
		 		var right_lower = im.getPixel(j+1,i+1);

		 		var left_bool = 0;
		 		var right_bool = 0;
		 		var above_bool = 0;
		 		var below_bool = 0;
		 		var upper_left_bool = 0;
		 		var upper_right_bool = 0;
		 		var lower_left_bool = 0;
		 		var lower_right_bool = 0;

		 		if(left[0] > threshold_val)
		 		{
		 			left_bool = 1;
		 		}
		 		if(right[0] > threshold_val)
		 		{
		 			right_bool = 1;
		 		}
		 		if(above[0] > threshold_val)
		 		{
		 			above_bool = 1;
		 		}
		 		if(below[0] > threshold_val)
		 		{
		 			below_bool = 1;
		 		}
		 		if(left_lower[0] > threshold_val)
		 		{
		 			lower_left_bool = 1;
		 		}
		 		if(right_lower[0] > threshold_val)
		 		{
		 			lower_right_bool = 1;
		 		}
		 		if(left_upper[0] > threshold_val)
		 		{
		 			upper_left_bool = 1;
		 		}
		 		if(right_upper[0] > threshold_val)
		 		{
		 			upper_right_bool = 1;
		 		}

		 		neighbours = left_bool + right_bool + above_bool + below_bool + lower_left_bool + lower_right_bool + upper_right_bool + upper_left_bool;

		 		if (neighbours >= 4)
		 		{
		 			binary_mask[i][j] = 1;
		 		}
		 	}
		}
		neighbs_count[neighbours] = neighbs_count[neighbours] + 1;
	}
}

for (i=0;i<9;i++)
{
	print(i + "has count " + neighbs_count[i]);
}

// Label pins on new image
im_proc = IJ.getProcessor();

for (i = 0; i < im_height; i++)
{
	for (j = 0; j < im_width; j++)
	{
		 if (binary_mask[i][j] === 1)
		 {
		 	im_proc.putPixel(j,i,255);
		 } else {
		 	im_proc.putPixel(j,i,0);
		 }
	}
}

im_mask_show = ImagePlus("Masked Image",im_proc);
im_mask_show.show();

// Calculate pin dimensions

// Calculate pin distances

// Output data to CSV file

